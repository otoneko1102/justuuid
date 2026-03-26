import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { countSimilarityPairs, listSimilarityPairs } from '$lib/db';
import { ensureRankingData } from '$lib/ranking';

function parseNonNegativeInt(value: unknown, fallback: number): number {
	const parsed = Number.parseInt(String(value ?? ''), 10);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const POST: RequestHandler = async ({ platform, request }) => {
	const db = platform?.env?.DB;

	if (!db) {
		return json({ pairs: [], totalCount: 0 }, { status: 500 });
	}

	try {
		const body = (await request.json().catch(() => ({}))) as {
			offset?: number;
			limit?: number;
		};
		const offset = parseNonNegativeInt(body.offset, 0);
		const limit = Math.min(200, parseNonNegativeInt(body.limit, 20));

		await ensureRankingData(db);
		const [pairs, totalCount] = await Promise.all([
			listSimilarityPairs(db, limit, offset),
			countSimilarityPairs(db),
		]);

		return json({ pairs, totalCount });
	} catch {
		return json({ pairs: [], totalCount: 0 }, { status: 503 });
	}
};
