import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserById } from '$lib/db';

export const load: PageServerLoad = async ({ params, platform, locals, url }) => {
	const db = platform?.env?.DB;

	if (!db) {
		error(500, 'Database not available');
	}

	const user = await getUserById(db, params.uuid);

	if (!user) {
		error(404, 'User not found');
	}

	const isOwner = locals.user?.id === user.id;

	return { user, isOwner, origin: url.origin };
};