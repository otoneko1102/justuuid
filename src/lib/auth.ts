import type { JWTPayload } from '$lib/types';

const encoder = new TextEncoder();

// Cast Uint8Array.buffer to ArrayBuffer for workers-types compatibility.
function toBuffer(data: Uint8Array): ArrayBuffer {
	return data.buffer as unknown as ArrayBuffer;
}

function base64url(buf: ArrayBuffer): string {
	return btoa(String.fromCharCode(...new Uint8Array(buf)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

function base64urlDecode(str: string): ArrayBuffer {
	const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
	const bin = atob(b64);
	const buf = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
	return toBuffer(buf);
}

async function importKey(secret: string): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		'raw',
		toBuffer(encoder.encode(secret)),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify']
	);
}

export async function signJWT(
	payload: Omit<JWTPayload, 'iat' | 'exp'>,
	secret: string
): Promise<string> {
	const now = Math.floor(Date.now() / 1000);
	const fullPayload: JWTPayload = {
		...payload,
		iat: now,
		exp: now + 60 * 60 * 24 * 30, // 30 days
	};

	const header = base64url(toBuffer(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))));
	const body = base64url(toBuffer(encoder.encode(JSON.stringify(fullPayload))));
	const key = await importKey(secret);
	const sig = await crypto.subtle.sign(
		'HMAC',
		key,
		toBuffer(encoder.encode(`${header}.${body}`))
	);

	return `${header}.${body}.${base64url(sig)}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;

		const [header, body, sig] = parts;
		const key = await importKey(secret);

		const valid = await crypto.subtle.verify(
			'HMAC',
			key,
			base64urlDecode(sig),
			toBuffer(encoder.encode(`${header}.${body}`))
		);
		if (!valid) return null;

		const payload: JWTPayload = JSON.parse(
			new TextDecoder().decode(base64urlDecode(body))
		);

		if (payload.exp < Math.floor(Date.now() / 1000)) return null;

		return payload;
	} catch {
		return null;
	}
}
