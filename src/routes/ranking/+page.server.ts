import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTopSimilarityPairs } from '$lib/db';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform?.env?.DB;

	if (!db) {
		throw error(500, 'Database not available');
	}

	let pairs;
	try {
		pairs = await getTopSimilarityPairs(db, 50);
	} catch {
		throw error(503, 'Database temporarily unavailable');
	}

	return { pairs };
};
