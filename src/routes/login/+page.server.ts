import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform, cookies, url }) => {
	// Already logged in
	if (locals.user) {
		redirect(302, `/u/${locals.user.id}`);
	}

	const clientId = platform?.env?.GITHUB_CLIENT_ID;
	if (!clientId) {
		throw new Error('GITHUB_CLIENT_ID is not configured');
	}

	// CSRF state parameter
	const state = crypto.randomUUID();
	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax',
	});

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: `${url.origin}/auth/callback`,
		scope: 'read:user',
		state,
	});

	redirect(302, `https://github.com/login/oauth/authorize?${params}`);
};