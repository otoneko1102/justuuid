import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, depends, url }) => {
	depends('app:lang');
	return {
		user: locals.user,
		lang: locals.lang,
		origin: url.origin,
		pathname: url.pathname,
	};
};
