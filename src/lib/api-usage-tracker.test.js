import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/platform-settings', () => ({
  getPlatformSettings: () => ({
    dailyLimit: 1000,
    softBlockThreshold: 950,
    refreshIntervalMs: 3600000,
  }),
}));

vi.mock('@/lib/weather-snapshot-repo', () => ({
  getRecentApiCalls: () => [],
  getUsageBreakdown: () => ({ geocode: 0, weather: 0 }),
  getDailyUsageCounts: () => ({ upstream: 0, blocked: 0, cacheHits: 0 }),
  logApiCall: () => {},
}));

import {
  __resetUsageTrackerForTests,
  canMakeUpstreamCall,
  getUsageSnapshot,
} from '@/lib/api-usage-tracker';

describe('api-usage-tracker', () => {
  beforeEach(() => {
    __resetUsageTrackerForTests();
  });

  it('allows upstream calls under the daily limit', () => {
    expect(canMakeUpstreamCall()).toBe(true);
    expect(getUsageSnapshot().status).toBe('ok');
  });
});
