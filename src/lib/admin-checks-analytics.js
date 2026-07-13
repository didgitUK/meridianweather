import {
  WEATHER_CHECK_CACHE_OUTCOMES,
  WEATHER_CHECK_TRIGGER_VALUES,
  labelWeatherCheckTrigger,
  normalizeWeatherCheckTrigger,
} from '@/constants/weather-check-triggers';
import { getDb } from '@/lib/db';
import { getUsageSnapshot } from '@/lib/api-usage-tracker';
import { listPlatformChecks } from '@/lib/location-repo';

function dayKey(iso) {
  return iso.slice(0, 10);
}

function buildDayBuckets(days) {
  const buckets = [];
  const now = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - offset,
    ));
    buckets.push(date.toISOString().slice(0, 10));
  }

  return buckets;
}

export function getChecksAnalytics({ days = 14 } = {}) {
  const safeDays = Math.min(90, Math.max(1, Number(days) || 14));
  const fromDate = new Date();
  fromDate.setUTCDate(fromDate.getUTCDate() - (safeDays - 1));
  fromDate.setUTCHours(0, 0, 0, 0);
  const fromIso = fromDate.toISOString();

  const rows = getDb()
    .prepare(
      `SELECT c.recorded_at, c."trigger", c.cache_outcome, c.tokens_used,
              c.location_id, l.name, l.label, l.country
       FROM location_weather_checks c
       INNER JOIN locations l ON l.id = c.location_id
       WHERE c.recorded_at >= ?
       ORDER BY c.recorded_at ASC`,
    )
    .all(fromIso);

  const dayBuckets = buildDayBuckets(safeDays);
  const checksByDay = Object.fromEntries(
    dayBuckets.map((day) => [day, { day, total: 0, tokens: 0 }]),
  );
  const byTrigger = {};
  let upstreamCount = 0;
  let cacheCount = 0;
  let tokensSpent = 0;
  const locationSpend = new Map();

  for (const trigger of WEATHER_CHECK_TRIGGER_VALUES) {
    byTrigger[trigger] = {
      trigger,
      label: labelWeatherCheckTrigger(trigger),
      checks: 0,
      tokens: 0,
    };
  }

  for (const row of rows) {
    const day = dayKey(row.recorded_at);
    const trigger = normalizeWeatherCheckTrigger(row.trigger);
    const tokens = Number(row.tokens_used) || 0;

    if (checksByDay[day]) {
      checksByDay[day].total += 1;
      checksByDay[day].tokens += tokens;
      checksByDay[day][trigger] = (checksByDay[day][trigger] ?? 0) + 1;
    }

    if (!byTrigger[trigger]) {
      byTrigger[trigger] = {
        trigger,
        label: labelWeatherCheckTrigger(trigger),
        checks: 0,
        tokens: 0,
      };
    }

    byTrigger[trigger].checks += 1;
    byTrigger[trigger].tokens += tokens;
    tokensSpent += tokens;

    if (row.cache_outcome === WEATHER_CHECK_CACHE_OUTCOMES.upstream) {
      upstreamCount += 1;
    } else {
      cacheCount += 1;
    }

    const existing = locationSpend.get(row.location_id) ?? {
      locationId: row.location_id,
      label: row.label ?? row.name ?? 'Unknown location',
      country: row.country ?? null,
      checks: 0,
      tokens: 0,
    };
    existing.checks += 1;
    existing.tokens += tokens;
    locationSpend.set(row.location_id, existing);
  }

  const topLocations = [...locationSpend.values()]
    .sort((a, b) => b.tokens - a.tokens || b.checks - a.checks)
    .slice(0, 10);

  const usage = getUsageSnapshot();

  return {
    days: safeDays,
    from: fromIso,
    totals: {
      checks: rows.length,
      tokensSpent,
      upstreamCount,
      cacheCount,
      cacheHitRate: rows.length
        ? Number(((cacheCount / rows.length) * 100).toFixed(1))
        : 0,
    },
    checksOverTime: dayBuckets.map((day) => checksByDay[day]),
    tokensByTrigger: Object.values(byTrigger)
      .filter((entry) => entry.checks > 0)
      .sort((a, b) => b.tokens - a.tokens || b.checks - a.checks),
    cacheVsUpstream: [
      { name: 'Upstream', value: upstreamCount, key: 'upstream' },
      { name: 'Cache', value: cacheCount, key: 'cache' },
    ],
    topLocations,
    usage: {
      used: usage.used,
      dailyLimit: usage.dailyLimit,
      remaining: usage.remaining,
      percentUsed: usage.percentUsed,
      status: usage.status,
      recentCalls: usage.recentCalls?.slice(0, 20) ?? [],
    },
  };
}

export function getAdminChecksLog({
  trigger,
  locationId,
  from,
  to,
  upstreamOnly = false,
  limit = 50,
  offset = 0,
} = {}) {
  return listPlatformChecks({
    trigger,
    locationId,
    from,
    to,
    upstreamOnly,
    limit,
    offset,
  });
}
