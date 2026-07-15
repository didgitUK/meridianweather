import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { SITE_ANALYTICS_EVENT_TYPES } from '@/constants/site-analytics';

export { SITE_ANALYTICS_EVENT_TYPES };

const ALLOWED_TYPES = new Set(Object.values(SITE_ANALYTICS_EVENT_TYPES));
const MAX_BATCH = 40;
const MAX_PATH_LENGTH = 200;
const MAX_SESSION_LENGTH = 80;
const MAX_SLOT_LENGTH = 64;

function dayKey(iso) {
  return iso.slice(0, 10);
}

function buildDayBuckets(days) {
  const buckets = [];
  const now = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset),
    );
    buckets.push(date.toISOString().slice(0, 10));
  }

  return buckets;
}

function sanitizePath(raw) {
  const value = String(raw ?? '').trim().slice(0, MAX_PATH_LENGTH);
  if (!value.startsWith('/')) {
    return '/';
  }
  // Drop query/hash and admin/auth noise paths at ingest.
  const pathOnly = value.split('?')[0].split('#')[0] || '/';
  if (
    /(^|\/)admin(\/|$)/.test(pathOnly) ||
    /(^|\/)login(\/|$)/.test(pathOnly) ||
    pathOnly.startsWith('/api') ||
    pathOnly.includes('/api/')
  ) {
    return '';
  }
  return pathOnly;
}

function sanitizeSessionId(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, MAX_SESSION_LENGTH);
}

function sanitizeSlotId(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, MAX_SLOT_LENGTH);
}

/**
 * @param {Array<{ type?: string, path?: string, sessionId?: string, slotId?: string, value?: number }>} events
 * @returns {{ accepted: number, rejected: number }}
 */
export function recordSiteAnalyticsEvents(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return { accepted: 0, rejected: 0 };
  }

  const batch = events.slice(0, MAX_BATCH);
  const insert = getDb().prepare(
    `INSERT INTO site_analytics_events (
       id, event_type, path, session_id, slot_id, value, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );

  let accepted = 0;
  let rejected = 0;
  const now = new Date().toISOString();

  const tx = getDb().transaction((rows) => {
    for (const row of rows) {
      const type = String(row?.type ?? '').trim();
      const sessionId = sanitizeSessionId(row?.sessionId);
      const path = sanitizePath(row?.path);

      if (!ALLOWED_TYPES.has(type) || !sessionId || !path) {
        rejected += 1;
        continue;
      }

      const value = Number(row?.value);
      const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(value, 86_400)) : 0;

      insert.run(
        uuidv4(),
        type,
        path,
        sessionId,
        sanitizeSlotId(row?.slotId),
        safeValue,
        now,
      );
      accepted += 1;
    }
  });

  tx(batch);
  return { accepted, rejected };
}

/**
 * @param {{ days?: number }} [options]
 */
export function getSiteAnalyticsOverview({ days = 14 } = {}) {
  const safeDays = Math.min(90, Math.max(1, Number(days) || 14));
  const fromDate = new Date();
  fromDate.setUTCDate(fromDate.getUTCDate() - (safeDays - 1));
  fromDate.setUTCHours(0, 0, 0, 0);
  const fromIso = fromDate.toISOString();

  const rows = getDb()
    .prepare(
      `SELECT event_type, path, session_id, slot_id, value, created_at
       FROM site_analytics_events
       WHERE created_at >= ?
       ORDER BY created_at ASC`,
    )
    .all(fromIso);

  const dayBuckets = buildDayBuckets(safeDays);
  const pageviewsByDay = Object.fromEntries(
    dayBuckets.map((day) => [day, { day, pageviews: 0, sessions: new Set() }]),
  );

  const sessions = new Set();
  let pageviews = 0;
  let engagementSum = 0;
  let engagementCount = 0;
  let scrollSum = 0;
  let scrollCount = 0;
  const pathCounts = new Map();
  const slotCounts = new Map();
  const scrollBuckets = [
    { id: '0-25', label: '0–25%', count: 0 },
    { id: '25-50', label: '25–50%', count: 0 },
    { id: '50-75', label: '50–75%', count: 0 },
    { id: '75-100', label: '75–100%', count: 0 },
  ];

  for (const row of rows) {
    sessions.add(row.session_id);
    const day = dayKey(row.created_at);

    if (row.event_type === SITE_ANALYTICS_EVENT_TYPES.pageview) {
      pageviews += 1;
      pathCounts.set(row.path, (pathCounts.get(row.path) ?? 0) + 1);
      if (pageviewsByDay[day]) {
        pageviewsByDay[day].pageviews += 1;
        pageviewsByDay[day].sessions.add(row.session_id);
      }
    }

    if (row.event_type === SITE_ANALYTICS_EVENT_TYPES.engagement) {
      engagementSum += Number(row.value) || 0;
      engagementCount += 1;
    }

    if (row.event_type === SITE_ANALYTICS_EVENT_TYPES.scroll) {
      const depth = Math.min(100, Number(row.value) || 0);
      scrollSum += depth;
      scrollCount += 1;
      if (depth < 25) scrollBuckets[0].count += 1;
      else if (depth < 50) scrollBuckets[1].count += 1;
      else if (depth < 75) scrollBuckets[2].count += 1;
      else scrollBuckets[3].count += 1;
    }

    if (row.event_type === SITE_ANALYTICS_EVENT_TYPES.adView) {
      const slot = row.slot_id || 'unknown';
      slotCounts.set(slot, (slotCounts.get(slot) ?? 0) + 1);
    }
  }

  const trafficOverTime = dayBuckets.map((day) => ({
    day,
    pageviews: pageviewsByDay[day].pageviews,
    sessions: pageviewsByDay[day].sessions.size,
  }));

  const topPaths = [...pathCounts.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const adViewsBySlot = [...slotCounts.entries()]
    .map(([slotId, count]) => ({ slotId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    days: safeDays,
    totals: {
      pageviews,
      sessions: sessions.size,
      avgEngagementSeconds:
        engagementCount > 0 ? Math.round(engagementSum / engagementCount) : 0,
      avgScrollDepthPct: scrollCount > 0 ? Math.round(scrollSum / scrollCount) : 0,
      adViews: [...slotCounts.values()].reduce((sum, n) => sum + n, 0),
    },
    trafficOverTime,
    topPaths,
    adViewsBySlot,
    scrollDepth: scrollBuckets,
  };
}
