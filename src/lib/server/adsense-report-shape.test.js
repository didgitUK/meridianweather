import { describe, expect, it } from 'vitest';
import {
  formatAdSenseCount,
  formatAdSenseMoney,
  formatAdSensePercent,
  shapeAdSenseReportForAdmin,
} from './adsense-report-shape';

describe('adsense-report-shape', () => {
  it('formats money, counts, and percents', () => {
    expect(formatAdSenseMoney(12.5, 'GBP')).toMatch(/£|GBP|12/);
    expect(formatAdSenseCount(1500)).toBe('1,500');
    expect(formatAdSensePercent(0.1234)).toBe('12.34%');
  });

  it('shapes cached report totals into KPIs and series', () => {
    const shaped = shapeAdSenseReportForAdmin({
      rangeId: '7d',
      currencyCode: 'GBP',
      startDate: { year: 2026, month: 7, day: 1 },
      endDate: { year: 2026, month: 7, day: 7 },
      fetchedAt: '2026-07-12T10:00:00.000Z',
      byDate: {
        totals: {
          ESTIMATED_EARNINGS: '42.5',
          CLICKS: '10',
          IMPRESSIONS: '1000',
          PAGE_VIEWS_CTR: '0.01',
          COST_PER_CLICK: '4.25',
          IMPRESSION_RPM: '42.5',
          ACTIVE_VIEW_VIEWABILITY: '0.7',
          AD_REQUESTS: '1100',
        },
        rows: [
          {
            DATE: '2026-07-01',
            ESTIMATED_EARNINGS: '10',
            CLICKS: '2',
            IMPRESSIONS: '200',
          },
        ],
      },
      byPage: {
        rows: [{ PAGE_URL: 'https://example.com/', ESTIMATED_EARNINGS: '5', CLICKS: '1', IMPRESSIONS: '50' }],
      },
      byPlatform: { rows: [{ PLATFORM_TYPE_NAME: 'High-end mobile devices', ESTIMATED_EARNINGS: '3' }] },
      byCountry: { rows: [{ COUNTRY_NAME: 'United Kingdom', ESTIMATED_EARNINGS: '4' }] },
    });

    expect(shaped.kpis.estimatedEarnings).toBe(42.5);
    expect(shaped.earningsSeries).toHaveLength(1);
    expect(shaped.topPages[0].pageUrl).toBe('https://example.com/');
    expect(shaped.platforms[0].name).toContain('mobile');
    expect(shaped.countries[0].name).toBe('United Kingdom');
  });
});
