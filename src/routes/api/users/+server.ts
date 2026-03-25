import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listUsers, type UserSort } from '$lib/db';

function parseSort(value: string | null): UserSort {
	return value === 'newest' || value === 'oldest' ? value : 'random';
}

function parsePositiveInt(value: string | null, fallback: number): number {
	const parsed = Number.parseInt(value ?? '', 10);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseExcludeIds(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.filter((id): id is string => typeof id === 'string' && id.length > 0)
		.slice(0, 500);
}

export const POST: RequestHandler = async ({ platform, request }) => {
	const db = platform?.env?.DB;

	if (!db) {
		return json({ users: [] }, { status: 500 });
	}

	try {
		const body = (await request.json().catch(() => ({}))) as {
			sort?: string;
			offset?: number;
			limit?: number;
			excludeIds?: unknown;
		};
		const sort = parseSort(body.sort ?? null);
		const offset = parsePositiveInt(String(body.offset ?? ''), 0);
		const limit = parsePositiveInt(String(body.limit ?? ''), 12);
		const excludeIds = parseExcludeIds(body.excludeIds);
		const users = await listUsers(db, limit, sort, offset, excludeIds);

		return json({ users });
	} catch {
		return json({ users: [] }, { status: 503 });
	}
};
