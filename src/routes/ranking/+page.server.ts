import type { PageServerLoad } from './$types';
import { countSimilarityPairs, listSimilarityPairs } from '$lib/db';
import { ensureRankingData } from '$lib/ranking';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform?.env?.DB;
	const INITIAL_RANKING_LIMIT = 20;

	if (!db) {
		return { pairs: [], totalCount: 0 };
	}

	try {
		await ensureRankingData(db);
		const [pairs, totalCount] = await Promise.all([
			listSimilarityPairs(db, INITIAL_RANKING_LIMIT, 0),
			countSimilarityPairs(db),
		]);

		return { pairs, totalCount };
	} catch {
		return { pairs: [], totalCount: 0 };
	}
};
