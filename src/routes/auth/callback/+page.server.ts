import { redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { signJWT } from '$lib/auth';
import { getUserByGithubId, createUser, updateUser } from '$lib/db';

interface GitHubUser {
	id: number;
	login: string;
	avatar_url: string;
}

export const load: PageServerLoad = async ({ url, cookies, platform, locals }) => {
	// Already logged in
	if (locals.user) {
		redirect(302, `/u/${locals.user.id}`);
	}

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('oauth_state');

	// Validate CSRF state
	if (!code || !state || !storedState || state !== storedState) {
		cookies.delete('oauth_state', { path: '/' });
		redirect(302, '/?error=invalid_state');
	}

	cookies.delete('oauth_state', { path: '/' });

	const env = platform?.env;
	if (!env?.GITHUB_CLIENT_ID || !env?.GITHUB_CLIENT_SECRET || !env?.JWT_SECRET || !env?.DB) {
		redirect(302, '/?error=config');
	}

	try {
		// Exchange code for access token
		const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				client_id: env.GITHUB_CLIENT_ID,
				client_secret: env.GITHUB_CLIENT_SECRET,
				code,
			}),
		});

		if (!tokenRes.ok) {
			redirect(302, '/?error=token');
		}

		const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
		if (!tokenData.access_token) {
			redirect(302, '/?error=token');
		}

		// Fetch GitHub user info
		const userRes = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokenData.access_token}`,
				'User-Agent': 'JustUUID/1.0',
			},
		});

		if (!userRes.ok) {
			redirect(302, '/?error=github');
		}

		const githubUser = (await userRes.json()) as GitHubUser;

		// Upsert user in D1
		let dbUser = await getUserByGithubId(env.DB, githubUser.id);

		if (!dbUser) {
			dbUser = await createUser(env.DB, githubUser.id, githubUser.login, githubUser.avatar_url);
		} else {
			// Update profile info in case they changed their GitHub name/avatar
			await updateUser(env.DB, githubUser.id, githubUser.login, githubUser.avatar_url);
			dbUser.username = githubUser.login;
			dbUser.avatar_url = githubUser.avatar_url;
		}

		// Issue JWT session cookie
		const token = await signJWT(
			{
				sub: dbUser.id,
				gid: dbUser.github_id,
				usr: dbUser.username,
				avt: dbUser.avatar_url,
			},
			env.JWT_SECRET
		);

		cookies.set('session', token, {
			path: '/',
			httpOnly: true,
			secure: true,
			maxAge: 60 * 60 * 24 * 30, // 30 days
			sameSite: 'lax',
		});

		redirect(302, `/u/${dbUser.id}`);
	} catch (e) {
		// Re-throw SvelteKit redirect/error responses
		if (isRedirect(e) || isHttpError(e)) throw e;
		// Log the actual error for debugging in Cloudflare logs
		console.error('[auth/callback] Unexpected error:', e);
		redirect(302, '/?error=server');
	}
};