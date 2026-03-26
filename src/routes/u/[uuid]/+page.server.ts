import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserById, getAllUserIds, getUsersByIds } from '$lib/db';
import { topSimilar } from '$lib/similarity';
import type { UserWithScore } from '$lib/types';

export const load: PageServerLoad = async ({ params, platform, locals, url }) => {
	const db = platform?.env?.DB;

	if (!db) {
		throw error(500, 'Database not available');
	}

	let user;
	try {
		user = await getUserById(db, params.uuid);
	} catch {
		throw error(503, 'Database temporarily unavailable');
	}

	if (!user) {
		throw error(404, 'User not found');
	}

	const isOwner = locals.user?.id === user.id;

	// Fetch similar users in parallel with nothing else (allIds needed first).
	let similarUsers: UserWithScore[] = [];
	try {
		const allIds = await getAllUserIds(db);
		const topResults = topSimilar(user.id, allIds, 5);
		if (topResults.length > 0) {
			const topIds = topResults.map((r) => r.id);
			const users = await getUsersByIds(db, topIds);
			// Build a score map and preserve order.
			const scoreMap = new Map(topResults.map((r) => [r.id, r.score]));
			similarUsers = topIds
				.map((id) => {
					const u = users.find((u) => u.id === id);
					return u ? { ...u, score: scoreMap.get(id) ?? 0 } : null;
				})
				.filter((u): u is UserWithScore => u !== null);
		}
	} catch {
		// Non-fatal: similarity section simply won't appear.
		similarUsers = [];
	}

	return { user, isOwner, origin: url.origin, similarUsers };
};