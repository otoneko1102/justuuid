import type { PageServerLoad } from './$types';
import {
	ensureSimilarityPairsSchema,
	getAllUserIds,
	getTopSimilarityPairs,
	replaceSimilarityPairs,
} from '$lib/db';
import { topPairs } from '$lib/similarity';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform?.env?.DB;

	if (!db) {
		return { pairs: [] };
	}

	try {
		await ensureSimilarityPairsSchema(db);
		let pairs = await getTopSimilarityPairs(db, 50);

		// Backfill ranking table on-demand if it is empty.
		// This avoids blank ranking pages when `similarity_pairs` has not been populated yet.
		if (pairs.length === 0) {
			const allIds = await getAllUserIds(db);

			if (allIds.length >= 2) {
				const computedPairs = topPairs(allIds, 100);
				await replaceSimilarityPairs(db, computedPairs);
				pairs = await getTopSimilarityPairs(db, 50);
			}
		}

		return { pairs };
	} catch {
		return { pairs: [] };
	}
};
