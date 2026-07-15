import { afterEach, describe, expect, it } from 'vitest';
import { checkRateLimit, resetRateLimitStore } from './rate-limit';

describe('rate-limit', () => {
  afterEach(() => {
    resetRateLimitStore();
  });

  it('allows up to the limit then blocks', () => {
    const now = 1_000_000;
    expect(checkRateLimit({ key: 'a', limit: 2, windowMs: 60_000, now }).ok).toBe(true);
    expect(checkRateLimit({ key: 'a', limit: 2, windowMs: 60_000, now }).ok).toBe(true);
    expect(checkRateLimit({ key: 'a', limit: 2, windowMs: 60_000, now }).ok).toBe(false);
  });

  it('resets after the window', () => {
    const now = 1_000_000;
    checkRateLimit({ key: 'b', limit: 1, windowMs: 1000, now });
    expect(checkRateLimit({ key: 'b', limit: 1, windowMs: 1000, now }).ok).toBe(false);
    expect(checkRateLimit({ key: 'b', limit: 1, windowMs: 1000, now: now + 1001 }).ok).toBe(true);
  });
});
