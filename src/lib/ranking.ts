import type { D1Database } from '@cloudflare/workers-types';
import {
	countSimilarityPairs,
	countUsers,
	ensureSimilarityPairsSchema,
	getAllUserIds,
	replaceSimilarityPairs,
} from '$lib/db';
import { topPairs } from '$lib/similarity';

export const MAX_GLOBAL_RANKING_PAIRS = 500;
const GLOBAL_RANKING_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const GLOBAL_RANKING_LOCK_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

interface RankingMetaRow {
	updated_at: string | null;
	user_count: number;
	refreshing: number;
	refresh_started_at: string | null;
}

function toIso(ms: number): string {
	return new Date(ms).toISOString();
}

function isStale(meta: RankingMetaRow): boolean {
	if (!meta.updated_at) {
		return true;
	}

	const updatedAt = Date.parse(meta.updated_at);
	if (!Number.isFinite(updatedAt)) {
		return true;
	}

	return Date.now() - updatedAt >= GLOBAL_RANKING_REFRESH_INTERVAL_MS;
}

async function ensureRankingMetaSchema(db: D1Database): Promise<void> {
	await db
		.prepare(
			`CREATE TABLE IF NOT EXISTS ranking_meta (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        updated_at TEXT,
        user_count INTEGER NOT NULL DEFAULT 0,
        refreshing INTEGER NOT NULL DEFAULT 0,
        refresh_started_at TEXT
      )`,
		)
		.run();

	await db
		.prepare(
			'INSERT OR IGNORE INTO ranking_meta (id, updated_at, user_count, refreshing, refresh_started_at) VALUES (1, NULL, 0, 0, NULL)',
		)
		.run();
}

async function getRankingMeta(db: D1Database): Promise<RankingMetaRow> {
	const row = await db
		.prepare(
			'SELECT updated_at, user_count, refreshing, refresh_started_at FROM ranking_meta WHERE id = 1',
		)
		.first<RankingMetaRow>();

	return (
		row ?? {
			updated_at: null,
			user_count: 0,
			refreshing: 0,
			refresh_started_at: null,
		}
	);
}

async function tryAcquireRefreshLock(
	db: D1Database,
	nowMs: number,
): Promise<boolean> {
	const result = await db
		.prepare(
			`UPDATE ranking_meta
       SET refreshing = 1, refresh_started_at = ?
       WHERE id = 1
         AND (
           refreshing = 0
           OR refresh_started_at IS NULL
           OR refresh_started_at < ?
         )`,
		)
		.bind(toIso(nowMs), toIso(nowMs - GLOBAL_RANKING_LOCK_TIMEOUT_MS))
		.run();

	return (result.meta?.changes ?? 0) > 0;
}

async function finalizeRefresh(
	db: D1Database,
	userCount: number,
	nowMs: number,
): Promise<void> {
	await db
		.prepare(
			`UPDATE ranking_meta
       SET updated_at = ?, user_count = ?, refreshing = 0, refresh_started_at = NULL
       WHERE id = 1`,
		)
		.bind(toIso(nowMs), userCount)
		.run();
}

async function releaseRefreshLock(db: D1Database): Promise<void> {
	await db
		.prepare(
			'UPDATE ranking_meta SET refreshing = 0, refresh_started_at = NULL WHERE id = 1',
		)
		.run();
}

/** Ensure the similarity ranking table exists and has data when possible. */
export async function ensureRankingData(db: D1Database): Promise<void> {
	await ensureSimilarityPairsSchema(db);
	await ensureRankingMetaSchema(db);

	const [meta, pairCount, userCount] = await Promise.all([
		getRankingMeta(db),
		countSimilarityPairs(db),
		countUsers(db),
	]);

	const shouldRefresh =
		pairCount === 0 || meta.user_count !== userCount || isStale(meta);

	if (!shouldRefresh) {
		return;
	}

	const nowMs = Date.now();
	const lockAcquired = await tryAcquireRefreshLock(db, nowMs);

	// Another request is already refreshing in the background.
	if (!lockAcquired) {
		return;
	}

	try {
		if (userCount < 2) {
			await replaceSimilarityPairs(db, []);
			await finalizeRefresh(db, userCount, nowMs);
			return;
		}

		const allIds = await getAllUserIds(db);
		const maxPairs = Math.min(
			MAX_GLOBAL_RANKING_PAIRS,
			Math.floor((allIds.length * (allIds.length - 1)) / 2),
		);
		const computedPairs = topPairs(allIds, maxPairs);
		await replaceSimilarityPairs(db, computedPairs);
		await finalizeRefresh(db, allIds.length, nowMs);
	} catch {
		// Keep existing ranking data if refresh fails.
		await releaseRefreshLock(db);
	}
}
