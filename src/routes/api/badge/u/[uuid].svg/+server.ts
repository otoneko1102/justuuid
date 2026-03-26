import type { RequestHandler } from './$types';
import { getUserById } from '$lib/db';

const BADGE_HEIGHT = 20;
const CHAR_WIDTH = 7;
const H_PADDING = 10;

function calcWidth(text: string): number {
	return text.length * CHAR_WIDTH + H_PADDING;
}

function escapeXml(text: string): string {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function renderBadge(
	label: string,
	message: string,
	valueColor: string,
): string {
	const safeLabel = escapeXml(label);
	const safeMessage = escapeXml(message);
	const labelWidth = calcWidth(label);
	const valueWidth = calcWidth(message);
	const totalWidth = labelWidth + valueWidth;
	const labelCenter = Math.floor(labelWidth / 2);
	const valueCenter = labelWidth + Math.floor(valueWidth / 2);

	return [
		`<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${BADGE_HEIGHT}" role="img" aria-label="${safeLabel}: ${safeMessage}">`,
		'<linearGradient id="s" x2="0" y2="100%">',
		'<stop offset="0" stop-color="#fff" stop-opacity=".7"/>',
		'<stop offset=".1" stop-color="#aaa" stop-opacity=".1"/>',
		'<stop offset=".9" stop-color="#000" stop-opacity=".3"/>',
		'<stop offset="1" stop-color="#000" stop-opacity=".5"/>',
		'</linearGradient>',
		`<mask id="m"><rect width="${totalWidth}" height="${BADGE_HEIGHT}" rx="3" fill="#fff"/></mask>`,
		'<g mask="url(#m)">',
		`<rect width="${labelWidth}" height="${BADGE_HEIGHT}" fill="#555"/>`,
		`<rect x="${labelWidth}" width="${valueWidth}" height="${BADGE_HEIGHT}" fill="${valueColor}"/>`,
		`<rect width="${totalWidth}" height="${BADGE_HEIGHT}" fill="url(#s)"/>`,
		'</g>',
		'<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">',
		`<text x="${labelCenter}" y="15" fill="#010101" fill-opacity=".3">${safeLabel}</text>`,
		`<text x="${labelCenter}" y="14">${safeLabel}</text>`,
		`<text x="${valueCenter}" y="15" fill="#010101" fill-opacity=".3">${safeMessage}</text>`,
		`<text x="${valueCenter}" y="14">${safeMessage}</text>`,
		'</g>',
		'</svg>',
	].join('');
}

export const GET: RequestHandler = async ({ platform, params }) => {
	const db = platform?.env?.DB;
	const cacheHeader =
		'public, max-age=300, s-maxage=300, stale-while-revalidate=300';

	if (!db) {
		return new Response(renderBadge('uuid', 'n/a', '#9f9f9f'), {
			status: 503,
			headers: {
				'content-type': 'image/svg+xml; charset=utf-8',
				'cache-control': cacheHeader,
			},
		});
	}

	const uuid = params.uuid?.trim();
	if (!uuid) {
		return new Response(renderBadge('uuid', 'invalid-uuid', '#e05d44'), {
			status: 400,
			headers: {
				'content-type': 'image/svg+xml; charset=utf-8',
				'cache-control': cacheHeader,
			},
		});
	}

	try {
		const user = await getUserById(db, uuid);

		if (!user) {
			return new Response(renderBadge('uuid', 'not-found', '#e05d44'), {
				status: 404,
				headers: {
					'content-type': 'image/svg+xml; charset=utf-8',
					'cache-control': cacheHeader,
				},
			});
		}

		return new Response(
			renderBadge(`${user.username}'s uuid`, user.id, '#4c1'),
			{
				headers: {
					'content-type': 'image/svg+xml; charset=utf-8',
					'cache-control': cacheHeader,
				},
			},
		);
	} catch {
		return new Response(renderBadge('uuid', 'n/a', '#9f9f9f'), {
			status: 503,
			headers: {
				'content-type': 'image/svg+xml; charset=utf-8',
				'cache-control': cacheHeader,
			},
		});
	}
};
