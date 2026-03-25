import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import {
	countUsers,
	getUserByUsername,
	hasAnyCollision,
	listUsers,
	searchUsers
} from '$lib/db';

export const load: PageServerLoad = async ({ platform, url }) => {
	const db = platform?.env?.DB;
	const query = url.searchParams.get('q')?.trim() ?? '';
	const lookupUsername = url.searchParams.get('user')?.trim() ?? '';
	const lookupError = url.searchParams.get('error') === 'user-not-found';
	const baseData = {
		query,
		lookupError: lookupError ? 'user-not-found' : null,
		lookupUsername
	};

	if (!db) {
		return {
			users: [],
			hasCollision: false,
			totalCount: 0,
			...baseData
		};
	}

	if (lookupUsername && !lookupError) {
		const user = await getUserByUsername(db, lookupUsername);

		if (user) {
			redirect(302, `/u/${user.id}`);
		}

		const redirectUrl = new URL(url);
		redirectUrl.pathname = '/';
		redirectUrl.search = '';
		redirectUrl.searchParams.set('error', 'user-not-found');
		redirectUrl.searchParams.set('user', lookupUsername);

		redirect(302, `${redirectUrl.pathname}${redirectUrl.search}`);
	}

	try {
		const [hasCollision, totalCount] = await Promise.all([
			hasAnyCollision(db),
			countUsers(db),
		]);

		const users = query
			? await searchUsers(db, query, 30)
			: await listUsers(db, 6);

		return {
			users,
			hasCollision,
			totalCount,
			...baseData
		};
	} catch {
		return {
			users: [],
			hasCollision: false,
			totalCount: 0,
			...baseData
		};
	}
};
