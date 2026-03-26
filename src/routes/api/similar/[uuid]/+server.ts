import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserById } from '$lib/db';
import { getSimilarUsersPage } from '$lib/similar-users';

function parseNonNegativeInt(value: unknown, fallback: number): number {
	const parsed = Number.parseInt(String(value ?? ''), 10);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const POST: RequestHandler = async ({ platform, params, request }) => {
	const db = platform?.env?.DB;

	if (!db) {
		return json({ users: [], total: 0 }, { status: 500 });
	}

	try {
		const body = (await request.json().catch(() => ({}))) as {
			offset?: number;
			limit?: number;
		};
		const offset = parseNonNegativeInt(body.offset, 0);
		const limit = Math.min(50, parseNonNegativeInt(body.limit, 10));
		const user = await getUserById(db, params.uuid);

		if (!user) {
			return json({ users: [], total: 0 }, { status: 404 });
		}

		const page = await getSimilarUsersPage(db, user.id, { offset, limit });
		return json(page);
	} catch {
		return json({ users: [], total: 0 }, { status: 503 });
	}
};
