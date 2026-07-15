import { getClientIpFromRequest } from '@/lib/geo/region-from-request';
import { apiError } from '@/lib/server/api-response';

/** @type {Map<string, { count: number, resetAt: number }>} */
const windows = new Map();

const MAX_BUCKETS = 10_000;

/**
 * In-memory fixed-window rate limiter (per process).
 * For multi-instance deploys, prefer an edge/WAF limit or shared store.
 *
 * @param {{ key: string, limit: number, windowMs?: number, now?: number }} options
 * @returns {{ ok: true, remaining: number, resetAt: number } | { ok: false, remaining: 0, resetAt: number, retryAfterSeconds: number }}
 */
export function checkRateLimit({ key, limit, windowMs = 60_000, now = Date.now() }) {
  if (!key || !Number.isFinite(limit) || limit < 1) {
    return { ok: true, remaining: limit, resetAt: now + windowMs };
  }

  if (windows.size > MAX_BUCKETS) {
    for (const [entryKey, entry] of windows) {
      if (entry.resetAt <= now) {
        windows.delete(entryKey);
      }
    }
  }

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    windows.set(key, { count: 1, resetAt });
    return { ok: true, remaining: Math.max(0, limit - 1), resetAt };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return {
    ok: true,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

/** Test helper — clears all buckets. */
export function resetRateLimitStore() {
  windows.clear();
}

export function getRateLimitClientKey(request, bucket) {
  const ip = getClientIpFromRequest(request) || 'unknown';
  return `${bucket}:${ip}`;
}

/**
 * @returns {Response | null} 429 response when limited, else null
 */
export function enforceRateLimit(request, { bucket, limit, windowMs = 60_000 }) {
  const result = checkRateLimit({
    key: getRateLimitClientKey(request, bucket),
    limit,
    windowMs,
  });

  if (result.ok) {
    return null;
  }

  const response = apiError(
    'rate_limited',
    'Too many requests. Please try again shortly.',
    429,
  );
  response.headers.set('Retry-After', String(result.retryAfterSeconds));
  return response;
}
