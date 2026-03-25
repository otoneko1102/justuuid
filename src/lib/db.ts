import type { D1Database } from '@cloudflare/workers-types';
import type { User } from '$lib/types';

export type UserSort = 'random' | 'newest' | 'oldest';

function mapRow(row: Record<string, unknown>): User {
	return {
		id: row.id as string,
		github_id: row.github_id as number,
		username: row.username as string,
		avatar_url: row.avatar_url as string,
		collision_detected: row.collision_detected === 1,
		created_at: row.created_at as string,
	};
}

/** Fetch user by UUID. Returns null if not found. */
export async function getUserById(db: D1Database, id: string): Promise<User | null> {
	const row = await db
		.prepare('SELECT * FROM users WHERE id = ?')
		.bind(id)
		.first<Record<string, unknown>>();
	return row ? mapRow(row) : null;
}

/** Fetch user by GitHub ID. Returns null if not found. */
export async function getUserByGithubId(db: D1Database, githubId: number): Promise<User | null> {
	const row = await db
		.prepare('SELECT * FROM users WHERE github_id = ?')
		.bind(githubId)
		.first<Record<string, unknown>>();
	return row ? mapRow(row) : null;
}

/** Fetch user by GitHub username (case-insensitive exact match). Returns null if not found. */
export async function getUserByUsername(db: D1Database, username: string): Promise<User | null> {
	const normalizedUsername = username.trim();

	if (!normalizedUsername) {
		return null;
	}

	const row = await db
		.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE LIMIT 1')
		.bind(normalizedUsername)
		.first<Record<string, unknown>>();
	return row ? mapRow(row) : null;
}

/** Create a new user, generating a UUID v4 (with collision detection). */
export async function createUser(
	db: D1Database,
	githubId: number,
	username: string,
	avatarUrl: string
): Promise<User> {
	let collisionDetected = false;
	let uuid: string;

	// Generate a UUID and confirm it is unique.
	// eslint-disable-next-line no-constant-condition
	while (true) {
		uuid = crypto.randomUUID();
		const existing = await db
			.prepare('SELECT id FROM users WHERE id = ?')
			.bind(uuid)
			.first();
		if (!existing) break;
		// A real UUID collision would be extremely rare.
		collisionDetected = true;
	}

	await db
		.prepare(
			'INSERT INTO users (id, github_id, username, avatar_url, collision_detected) VALUES (?, ?, ?, ?, ?)'
		)
		.bind(uuid!, githubId, username, avatarUrl, collisionDetected ? 1 : 0)
		.run();

	return {
		id: uuid!,
		github_id: githubId,
		username,
		avatar_url: avatarUrl,
		collision_detected: collisionDetected,
		created_at: new Date().toISOString(),
	};
}

/** Update username and avatar_url for an existing user (in case they changed on GitHub). */
export async function updateUser(
	db: D1Database,
	githubId: number,
	username: string,
	avatarUrl: string
): Promise<void> {
	await db
		.prepare('UPDATE users SET username = ?, avatar_url = ? WHERE github_id = ?')
		.bind(username, avatarUrl, githubId)
		.run();
}

function getUserSortOrder(sort: UserSort): string {
	switch (sort) {
		case 'newest':
			return 'created_at DESC';
		case 'oldest':
			return 'created_at ASC';
		default:
			return 'RANDOM()';
	}
}

/** Fetch a user selection for the home page listing. */
export async function listUsers(
	db: D1Database,
	limit = 12,
	sort: UserSort = 'random',
	offset = 0,
	excludeIds: string[] = []
): Promise<User[]> {
	if (sort === 'random' && excludeIds.length > 0) {
		const placeholders = excludeIds.map(() => '?').join(', ');
		const { results } = await db
			.prepare(`SELECT * FROM users WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT ?`)
			.bind(...excludeIds, limit)
			.all<Record<string, unknown>>();
		return results.map(mapRow);
	}

	const orderBy = getUserSortOrder(sort);
	const { results } = await db
		.prepare(`SELECT * FROM users ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
		.bind(limit, offset)
		.all<Record<string, unknown>>();
	return results.map(mapRow);
}

/** Search users by username (case-insensitive partial match). */
export async function searchUsers(
	db: D1Database,
	query: string,
	limit = 30,
	sort: UserSort = 'random',
	offset = 0
): Promise<User[]> {
	const orderBy = getUserSortOrder(sort);
	const { results } = await db
		.prepare(`SELECT * FROM users WHERE username LIKE ? ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
		.bind(`%${query}%`, limit, offset)
		.all<Record<string, unknown>>();
	return results.map(mapRow);
}

/** Returns the total number of registered users. */
export async function countUsers(db: D1Database): Promise<number> {
	const row = await db
		.prepare('SELECT COUNT(*) as cnt FROM users')
		.first<{ cnt: number }>();
	return row?.cnt ?? 0;
}

/** Returns true if any user in the DB has ever experienced a UUID collision. */
export async function hasAnyCollision(db: D1Database): Promise<boolean> {
	const row = await db
		.prepare('SELECT COUNT(*) as cnt FROM users WHERE collision_detected = 1')
		.first<{ cnt: number }>();
	return (row?.cnt ?? 0) > 0;
}
