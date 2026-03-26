import type { D1Database } from '@cloudflare/workers-types';
import { getAllUserIds, getUsersByIds } from '$lib/db';
import { topSimilar } from '$lib/similarity';
import type { UserWithScore } from '$lib/types';

interface SimilarUsersPageOptions {
	offset?: number;
	limit?: number;
}

interface SimilarUsersPage {
	users: UserWithScore[];
	total: number;
}

/** Return a paginated similarity ranking for one target UUID. */
export async function getSimilarUsersPage(
	db: D1Database,
	targetUuid: string,
	options: SimilarUsersPageOptions = {},
): Promise<SimilarUsersPage> {
	const offset = Math.max(0, options.offset ?? 0);
	const limit = Math.max(0, options.limit ?? 10);

	const allIds = await getAllUserIds(db);
	const total = Math.max(
		0,
		allIds.includes(targetUuid) ? allIds.length - 1 : allIds.length,
	);

	if (total === 0 || offset >= total || limit === 0) {
		return { users: [], total };
	}

	const requiredTopCount = Math.min(total, offset + limit);
	const topResults = topSimilar(targetUuid, allIds, requiredTopCount);
	const pageResults = topResults.slice(offset, offset + limit);

	if (pageResults.length === 0) {
		return { users: [], total };
	}

	const users = await getUsersByIds(
		db,
		pageResults.map((result) => result.id),
	);
	const userById = new Map(users.map((user) => [user.id, user]));

	const rankedUsers = pageResults
		.map((result) => {
			const user = userById.get(result.id);
			return user ? { ...user, score: result.score } : null;
		})
		.filter((user): user is UserWithScore => user !== null);

	return { users: rankedUsers, total };
}
