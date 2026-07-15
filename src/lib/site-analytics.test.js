import { afterEach, describe, expect, it, vi } from 'vitest';

const events = [];

vi.mock('@/lib/db', () => ({
  getDb: () => ({
    prepare: (sql) => {
      if (String(sql).startsWith('INSERT INTO site_analytics_events')) {
        return {
          run: (...args) => {
            events.push({
              id: args[0],
              event_type: args[1],
              path: args[2],
              session_id: args[3],
              slot_id: args[4],
              value: args[5],
              created_at: args[6],
            });
          },
        };
      }

      if (String(sql).includes('FROM site_analytics_events')) {
        return {
          all: () => events,
        };
      }

      return { run: () => {}, all: () => [], get: () => null };
    },
    transaction: (fn) => (rows) => fn(rows),
  }),
}));

import {
  getSiteAnalyticsOverview,
  recordSiteAnalyticsEvents,
  SITE_ANALYTICS_EVENT_TYPES,
} from './site-analytics.js';

describe('site-analytics', () => {
  afterEach(() => {
    events.length = 0;
  });

  it('records pageviews and rejects admin paths', () => {
    const result = recordSiteAnalyticsEvents([
      {
        type: SITE_ANALYTICS_EVENT_TYPES.pageview,
        path: '/en-GB',
        sessionId: 'sess-1',
      },
      {
        type: SITE_ANALYTICS_EVENT_TYPES.pageview,
        path: '/en-GB/admin',
        sessionId: 'sess-1',
      },
    ]);

    expect(result.accepted).toBe(1);
    expect(result.rejected).toBe(1);
    expect(events).toHaveLength(1);
  });

  it('aggregates sessions, scroll, engagement, and ad views', () => {
    recordSiteAnalyticsEvents([
      {
        type: SITE_ANALYTICS_EVENT_TYPES.pageview,
        path: '/en-GB',
        sessionId: 'a',
      },
      {
        type: SITE_ANALYTICS_EVENT_TYPES.pageview,
        path: '/en-GB/city/london',
        sessionId: 'b',
      },
      {
        type: SITE_ANALYTICS_EVENT_TYPES.scroll,
        path: '/en-GB',
        sessionId: 'a',
        value: 80,
      },
      {
        type: SITE_ANALYTICS_EVENT_TYPES.engagement,
        path: '/en-GB',
        sessionId: 'a',
        value: 40,
      },
      {
        type: SITE_ANALYTICS_EVENT_TYPES.adView,
        path: '/en-GB',
        sessionId: 'a',
        slotId: 'dashboard',
        value: 1,
      },
    ]);

    const overview = getSiteAnalyticsOverview({ days: 14 });

    expect(overview.totals.pageviews).toBe(2);
    expect(overview.totals.sessions).toBe(2);
    expect(overview.totals.avgScrollDepthPct).toBe(80);
    expect(overview.totals.avgEngagementSeconds).toBe(40);
    expect(overview.totals.adViews).toBe(1);
    expect(overview.adViewsBySlot[0]).toMatchObject({ slotId: 'dashboard', count: 1 });
    expect(overview.topPaths[0].path).toBe('/en-GB');
  });
});
