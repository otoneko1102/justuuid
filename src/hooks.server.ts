import type { Handle } from '@sveltejs/kit';
import { verifyJWT } from '$lib/auth';
import { detectLang } from '$lib/i18n';

export const handle: Handle = async ({ event, resolve }) => {
	// Language detection
	const cookieLang = event.cookies.get('lang');
	const acceptLang = event.request.headers.get('Accept-Language');
	event.locals.lang = detectLang(acceptLang, cookieLang);
	// Session handling
	event.locals.user = null;
	const token = event.cookies.get('session');

	if (token && event.platform?.env?.JWT_SECRET) {
		const payload = await verifyJWT(token, event.platform.env.JWT_SECRET);
		if (payload) {
			event.locals.user = {
				id: payload.sub,
				github_id: payload.gid,
				username: payload.usr,
				avatar_url: payload.avt,
			};
		}
	}

	const response = await resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('%sveltekit.lang%', event.locals.lang),
	});

	return response;
};
