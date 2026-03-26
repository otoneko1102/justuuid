export interface User {
	id: string;          // UUID v4
	github_id: number;
	username: string;
	avatar_url: string;
	collision_detected: boolean;
	created_at: string;
}

export interface UserWithScore extends User {
	score: number;
}

export interface SimilarityPair {
	uuid_a: string;
	uuid_b: string;
	score: number;
	username_a: string;
	avatar_url_a: string;
	username_b: string;
	avatar_url_b: string;
}

export type Lang = 'en' | 'ja';

export interface JWTPayload {
	sub: string;       // user UUID
	gid: number;       // github_id
	usr: string;       // username
	avt: string;       // avatar_url
	iat: number;
	exp: number;
}
