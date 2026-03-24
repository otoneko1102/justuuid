import type { PageServerLoad } from './$types';
import { listUsers, hasAnyCollision } from '$lib/db';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform?.env?.DB;

	if (!db) {
		return { users: [], hasCollision: false };
	}

	try {
		const [users, hasCollision] = await Promise.all([
			listUsers(db, 60),
			hasAnyCollision(db),
		]);

		return { users, hasCollision };
	} catch {
		// D1 table may not exist yet (migration not applied), degrade gracefully
		return { users: [], hasCollision: false };
	}
};