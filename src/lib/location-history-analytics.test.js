import { describe, expect, it } from 'vitest';
import { buildLocationHistoryInsights } from '@/lib/location-history-analytics';

describe('buildLocationHistoryInsights', () => {
  it('computes averages and year-over-year comparisons from observations', () => {
    const referenceDate = new Date('2026-07-09T12:00:00.000Z');
    const observations = [
      {
        observedAt: '2026-07-09T11:00:00.000Z',
        temperature: 20,
        humidity: 60,
        description: 'Sunny',
      },
      {
        observedAt: '2026-06-20T11:00:00.000Z',
        temperature: 18,
        humidity: 55,
      },
      {
        observedAt: '2026-05-10T11:00:00.000Z',
        temperature: 16,
        humidity: 50,
      },
      {
        observedAt: '2025-07-08T11:00:00.000Z',
        temperature: 17,
        humidity: 58,
      },
      {
        observedAt: '2025-07-10T11:00:00.000Z',
        temperature: 19,
        humidity: 57,
      },
    ];

    const insights = buildLocationHistoryInsights({ observations, referenceDate });

    expect(insights.current.temperature).toBe(20);
    expect(insights.averages.last30Days.sampleSize).toBe(2);
    expect(insights.averages.sameTimeLastYear.temperature).toBe(18);
    expect(insights.comparisons.currentVsSameTimeLastYear).toBe(2);
    expect(insights.hasEnoughDataForPublicInsights).toBe(false);
  });
});
