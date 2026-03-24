import type { PageServerLoad } from './$types';
import { listUsers, hasAnyCollision } from '$lib/db';

export const load: PageServerLoad = async ({ platform, locals }) => {
	const db = platform?.env?.DB;

	if (!db) {
		return { users: [], hasCollision: false };
	}

	const [users, hasCollision] = await Promise.all([
		listUsers(db, 60),
		hasAnyCollision(db),
	]);

	return { users, hasCollision };
};