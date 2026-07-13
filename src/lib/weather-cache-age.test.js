import { describe, expect, it } from 'vitest';
import {
  cacheMeetsMaxAge,
  getSnapshotAgeMs,
  resolveScopeMaxAgeMs,
} from '@/lib/weather-cache-age';

describe('weather-cache-age', () => {
  it('resolves per-scope max age values', () => {
    expect(resolveScopeMaxAgeMs(600_000, 'current')).toBe(600_000);
    expect(resolveScopeMaxAgeMs({ current: 600_000, daily: 3_600_000 }, 'daily')).toBe(3_600_000);
  });

  it('detects when cached snapshots are older than the requested max age', () => {
    const fetchedAt = new Date(Date.now() - 11 * 60 * 1000).toISOString();

    expect(getSnapshotAgeMs(fetchedAt)).toBeGreaterThan(10 * 60 * 1000);
    expect(cacheMeetsMaxAge({ meta: { fetchedAt } }, 10 * 60 * 1000)).toBe(false);
    expect(cacheMeetsMaxAge({ meta: { fetchedAt } }, null)).toBe(true);
  });
});
