import type { PageServerLoad } from './$types';
import { listUsers, searchUsers, countUsers, hasAnyCollision } from '$lib/db';

export const load: PageServerLoad = async ({ platform, url }) => {
	const db = platform?.env?.DB;
	const query = url.searchParams.get('q')?.trim() ?? '';

	if (!db) {
		return { users: [], hasCollision: false, totalCount: 0, query };
	}

	try {
		const [hasCollision, totalCount] = await Promise.all([
			hasAnyCollision(db),
			countUsers(db),
		]);

		const users = query
			? await searchUsers(db, query, 30)
			: await listUsers(db, 12);

		return { users, hasCollision, totalCount, query };
	} catch {
		return { users: [], hasCollision: false, totalCount: 0, query };
	}
};