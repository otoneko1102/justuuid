// See https://svelte.dev/docs/kit/types#app.d.ts
import type { D1Database } from '@cloudflare/workers-types';

declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
				GITHUB_CLIENT_ID: string;
				GITHUB_CLIENT_SECRET: string;
				JWT_SECRET: string;
			};
		}
		interface Locals {
			user: {
				id: string;
				github_id: number;
				username: string;
				avatar_url: string;
			} | null;
			lang: 'en' | 'ja';
		}
	}
}

export {};
