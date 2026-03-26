import type { D1Database } from '@cloudflare/workers-types';
import {
	countSimilarityPairs,
	ensureSimilarityPairsSchema,
	getAllUserIds,
	replaceSimilarityPairs,
} from '$lib/db';
import { topPairs } from '$lib/similarity';

export const MAX_GLOBAL_RANKING_PAIRS = 500;

/** Ensure the similarity ranking table exists and has data when possible. */
export async function ensureRankingData(db: D1Database): Promise<void> {
	await ensureSimilarityPairsSchema(db);
	const existingCount = await countSimilarityPairs(db);

	if (existingCount > 0) {
		return;
	}

	const allIds = await getAllUserIds(db);
	if (allIds.length < 2) {
		return;
	}

	const maxPairs = Math.min(
		MAX_GLOBAL_RANKING_PAIRS,
		Math.floor((allIds.length * (allIds.length - 1)) / 2),
	);
	const computedPairs = topPairs(allIds, maxPairs);
	await replaceSimilarityPairs(db, computedPairs);
}
