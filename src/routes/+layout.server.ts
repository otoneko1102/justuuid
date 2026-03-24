import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, depends }) => {
	depends('app:lang');
	return {
		user: locals.user,
		lang: locals.lang,
	};
};