/**
 * UUID similarity utilities.
 *
 * Algorithm: weighted bit comparison — bit i has weight 1/(i+1).
 * Leading bits matter more. Score is normalized to [0, 1].
 */

/** Strip hyphens and parse a UUID string into 16 bytes. */
function uuidToBytes(uuid: string): Uint8Array {
	const hex = uuid.replace(/-/g, '');
	const bytes = new Uint8Array(16);
	for (let i = 0; i < 16; i++) {
		bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	}
	return bytes;
}

// Pre-compute weights and max score once at module load (Worker isolate lifetime).
const NUM_BITS = 128;
const WEIGHTS = new Float32Array(NUM_BITS);
for (let i = 0; i < NUM_BITS; i++) {
	WEIGHTS[i] = 1 / (i + 1);
}
let MAX_SCORE = 0;
let BASELINE = 0;
for (let i = 0; i < NUM_BITS; i++) {
	MAX_SCORE += WEIGHTS[i];
	BASELINE += WEIGHTS[i] * 0.5; // random expectation: each bit matches 50%
}
// Effective range: [BASELINE, MAX_SCORE] → normalize to [0, 1]
const SCORE_RANGE = MAX_SCORE - BASELINE;

export interface SimilarityResult {
	id: string;
	score: number;
}

/**
 * Compute similarity between two UUID strings.
 * Returns a value in [0, 1].
 */
export function similarity(a: string, b: string): number {
	const ab = uuidToBytes(a);
	const bb = uuidToBytes(b);
	return _similarityBytes(ab, bb);
}

/** Inner: compute similarity from pre-parsed byte arrays. */
function _similarityBytes(ab: Uint8Array, bb: Uint8Array): number {
	let score = 0;
	let bitIdx = 0;
	for (let byteIdx = 0; byteIdx < 16; byteIdx++) {
		const xor = ab[byteIdx] ^ bb[byteIdx];
		for (let bit = 7; bit >= 0; bit--) {
			if (!((xor >> bit) & 1)) {
				score += WEIGHTS[bitIdx];
			}
			bitIdx++;
		}
	}
	// Normalize: subtract random baseline so random pairs ≈ 0%, identical = 100%
	return Math.max(0, (score - BASELINE) / SCORE_RANGE);
}

/**
 * Find the top `limit` most similar UUIDs to `target` among `candidates`.
 * Inline computation — avoids per-call overhead of similarity().
 * Returns sorted descending by score (excluding target itself).
 */
export function topSimilar(
	target: string,
	candidates: string[],
	limit = 10,
): SimilarityResult[] {
	const targetBytes = uuidToBytes(target);

	// Use a small array for top-K (limit is typically ≤10, so linear scan is fine).
	const results: SimilarityResult[] = [];

	for (const id of candidates) {
		if (id === target) continue;

		const cb = uuidToBytes(id);
		const score = _similarityBytes(targetBytes, cb);

		if (results.length < limit) {
			results.push({ id, score });
			// Keep sorted: insertion sort upward
			for (
				let i = results.length - 1;
				i > 0 && results[i].score > results[i - 1].score;
				i--
			) {
				const tmp = results[i];
				results[i] = results[i - 1];
				results[i - 1] = tmp;
			}
		} else if (score > results[results.length - 1].score) {
			results[results.length - 1] = { id, score };
			// Re-sort tail upward
			for (
				let i = results.length - 1;
				i > 0 && results[i].score > results[i - 1].score;
				i--
			) {
				const tmp = results[i];
				results[i] = results[i - 1];
				results[i - 1] = tmp;
			}
		}
	}

	return results;
}

export interface PairResult {
	uuid_a: string;
	uuid_b: string;
	score: number;
}

/**
 * Compute the top `limit` most similar UUID pairs from a list of UUIDs.
 * O(N^2) — pre-caches all byte arrays. Uses a bounded heap to avoid sorting
 * all O(N^2) pairs.
 */
export function topPairs(uuids: string[], limit = 100): PairResult[] {
	const n = uuids.length;
	if (n < 2) return [];

	// Pre-convert all UUIDs to bytes.
	const bytesCache: Uint8Array[] = new Array(n);
	for (let i = 0; i < n; i++) {
		bytesCache[i] = uuidToBytes(uuids[i]);
	}

	// Min-heap: keep top `limit` pairs by score.
	// Heap entry: [score, i, j]
	type HeapEntry = [number, number, number];
	const heap: HeapEntry[] = [];

	function heapPush(entry: HeapEntry) {
		heap.push(entry);
		let i = heap.length - 1;
		while (i > 0) {
			const parent = (i - 1) >> 1;
			if (heap[parent][0] > heap[i][0]) {
				const tmp = heap[parent];
				heap[parent] = heap[i];
				heap[i] = tmp;
				i = parent;
			} else break;
		}
	}

	function heapPop(): HeapEntry {
		const top = heap[0];
		const last = heap.pop()!;
		if (heap.length > 0) {
			heap[0] = last;
			let i = 0;
			while (true) {
				const l = 2 * i + 1;
				const r = 2 * i + 2;
				let smallest = i;
				if (l < heap.length && heap[l][0] < heap[smallest][0]) smallest = l;
				if (r < heap.length && heap[r][0] < heap[smallest][0]) smallest = r;
				if (smallest === i) break;
				const tmp = heap[smallest];
				heap[smallest] = heap[i];
				heap[i] = tmp;
				i = smallest;
			}
		}
		return top;
	}

	const pruneSize = limit * 2;

	for (let i = 0; i < n - 1; i++) {
		for (let j = i + 1; j < n; j++) {
			const score = _similarityBytes(bytesCache[i], bytesCache[j]);

			if (heap.length < limit) {
				heapPush([score, i, j]);
			} else if (score > heap[0][0]) {
				heapPop();
				heapPush([score, i, j]);
			}

			// Periodically prune to keep heap small (bounded by pruneSize, but
			// we already enforce limit via the else-if above, so this is a no-op
			// unless the logic changes; kept for clarity).
			if (heap.length > pruneSize) {
				while (heap.length > limit) heapPop();
			}
		}
	}

	// Extract results and sort descending.
	const results: PairResult[] = heap.map(([score, i, j]) => ({
		uuid_a: uuids[i] < uuids[j] ? uuids[i] : uuids[j],
		uuid_b: uuids[i] < uuids[j] ? uuids[j] : uuids[i],
		score,
	}));
	results.sort((a, b) => b.score - a.score);
	return results;
}
