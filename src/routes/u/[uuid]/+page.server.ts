import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserById } from '$lib/db';
import { getSimilarUsersPage } from '$lib/similar-users';
import type { UserWithScore } from '$lib/types';

export const load: PageServerLoad = async ({
	params,
	platform,
	locals,
	url,
}) => {
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
	const INITIAL_SIMILAR_LIMIT = 10;

	let similarUsers: UserWithScore[] = [];
	let similarTotalCount = 0;
	try {
		const similarPage = await getSimilarUsersPage(db, user.id, {
			offset: 0,
			limit: INITIAL_SIMILAR_LIMIT,
		});
		similarUsers = similarPage.users;
		similarTotalCount = similarPage.total;
	} catch {
		// Non-fatal: similarity section simply won't appear.
		similarUsers = [];
		similarTotalCount = 0;
	}

	return { user, isOwner, origin: url.origin, similarUsers, similarTotalCount };
};
