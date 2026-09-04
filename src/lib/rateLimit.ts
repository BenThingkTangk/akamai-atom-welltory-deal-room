// Simple in-memory sliding-window rate limiter. Suitable for a single-region
// Vercel serverless instance during preview; production should back this with
// a durable store (Upstash/Redis) — that's an approved-scope follow-up.

interface Bucket {
  hits: number[];
}

const store = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  reset_at: number;
}

export function rateLimit(key: string, limit: number, windowMs: number, now: number = Date.now()): RateLimitResult {
  const cutoff = now - windowMs;
  let bucket = store.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    store.set(key, bucket);
  }
  // Drop old hits.
  bucket.hits = bucket.hits.filter((t) => t > cutoff);
  if (bucket.hits.length >= limit) {
    return { ok: false, remaining: 0, reset_at: bucket.hits[0] + windowMs };
  }
  bucket.hits.push(now);
  return { ok: true, remaining: limit - bucket.hits.length, reset_at: now + windowMs };
}

/** Test-only helper to reset the store. */
export function _resetRateLimit(): void {
  store.clear();
}
