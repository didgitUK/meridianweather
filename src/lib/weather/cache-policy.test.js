import { describe, expect, it } from 'vitest';
import { classifySnapshot, wrapSnapshot } from '@/lib/weather/cache-policy';

describe('weather cache-policy', () => {
  it('classifies missing snapshots', () => {
    expect(classifySnapshot(null)).toBe('missing');
  });

  it('classifies fresh, acceptable, and expired snapshots', () => {
    const now = Date.now();

    expect(
      classifySnapshot({
        expiresAt: new Date(now + 60_000).toISOString(),
        staleUntil: new Date(now + 120_000).toISOString(),
      }),
    ).toBe('fresh');

    expect(
      classifySnapshot({
        expiresAt: new Date(now - 60_000).toISOString(),
        staleUntil: new Date(now + 60_000).toISOString(),
      }),
    ).toBe('acceptable');

    expect(
      classifySnapshot({
        expiresAt: new Date(now - 120_000).toISOString(),
        staleUntil: new Date(now - 60_000).toISOString(),
      }),
    ).toBe('expired');
  });

  it('wraps snapshots with meta for cache hits', () => {
    const fetchedAt = new Date().toISOString();
    const wrapped = wrapSnapshot(
      {
        payload: { temperature: 12 },
        fetchedAt,
        source: 'onecall_current',
      },
      'memory',
      'fresh',
    );

    expect(wrapped.data.temperature).toBe(12);
    expect(wrapped.meta.cacheLayer).toBe('memory');
    expect(wrapped.meta.freshness).toBe('fresh');
    expect(wrapped.meta.upstreamCallAvoided).toBe(true);
  });
});
