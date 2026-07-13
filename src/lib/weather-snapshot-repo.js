import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export function buildSnapshotKey(lat, lon, scope, lang = 'en') {
  if (scope === 'geocode') return `${scope}:${lat}`;
  const base = `${Number(lat).toFixed(4)},${Number(lon).toFixed(4)},${scope}`;
  return lang === 'en' ? base : `${base},${lang}`;
}

export function readSnapshot(cacheKey) {
  const row = getDb()
    .prepare('SELECT * FROM weather_snapshots WHERE cache_key = ?')
    .get(cacheKey);

  if (!row) return null;

  return {
    id: row.id,
    lat: row.lat,
    lon: row.lon,
    scope: row.scope,
    cacheKey: row.cache_key,
    payload: JSON.parse(row.payload_json),
    fetchedAt: row.fetched_at,
    expiresAt: row.expires_at,
    staleUntil: row.stale_until,
    source: row.source,
  };
}

export function writeSnapshot({
  lat = null,
  lon = null,
  scope,
  cacheKey,
  payload,
  fetchedAt,
  expiresAt,
  staleUntil,
  source,
}) {
  const id = uuidv4();
  getDb()
    .prepare(
      `INSERT INTO weather_snapshots (id, lat, lon, scope, cache_key, payload_json, fetched_at, expires_at, stale_until, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(cache_key) DO UPDATE SET
         payload_json = excluded.payload_json,
         fetched_at = excluded.fetched_at,
         expires_at = excluded.expires_at,
         stale_until = excluded.stale_until,
         source = excluded.source`,
    )
    .run(
      id,
      lat,
      lon,
      scope,
      cacheKey,
      JSON.stringify(payload),
      fetchedAt,
      expiresAt,
      staleUntil,
      source,
    );

  return readSnapshot(cacheKey);
}

export function logApiCall(entry) {
  getDb()
    .prepare(
      `INSERT INTO api_call_log (id, timestamp, endpoint, cache_hit, status, duration_ms, meta_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      entry.id,
      entry.timestamp,
      entry.endpoint,
      entry.cacheHit ? 1 : 0,
      entry.status,
      entry.durationMs ?? null,
      JSON.stringify(entry.meta ?? {}),
    );
}

export function getRecentApiCalls(limit = 50) {
  return getDb()
    .prepare('SELECT * FROM api_call_log ORDER BY timestamp DESC LIMIT ?')
    .all(limit)
    .map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      endpoint: row.endpoint,
      cacheHit: Boolean(row.cache_hit),
      status: row.status,
      durationMs: row.duration_ms,
      meta: row.meta_json ? JSON.parse(row.meta_json) : {},
    }));
}

export function getUsageBreakdown() {
  const rows = getDb()
    .prepare(
      `SELECT endpoint, COUNT(*) as count
       FROM api_call_log
       WHERE cache_hit = 0 AND status = '200' AND date(timestamp) = date('now')
       GROUP BY endpoint`,
    )
    .all();

  const breakdown = {};
  for (const row of rows) breakdown[row.endpoint] = row.count;
  return breakdown;
}

export function getDailyUsageCounts() {
  const row = getDb()
    .prepare(
      `SELECT
         SUM(CASE WHEN cache_hit = 0 AND status = '200' THEN 1 ELSE 0 END) AS upstream,
         SUM(CASE WHEN cache_hit = 0 AND status = 'blocked' THEN 1 ELSE 0 END) AS blocked,
         SUM(CASE WHEN cache_hit = 1 THEN 1 ELSE 0 END) AS cacheHits
       FROM api_call_log
       WHERE date(timestamp) = date('now')`,
    )
    .get();

  return {
    upstream: Number(row?.upstream ?? 0),
    blocked: Number(row?.blocked ?? 0),
    cacheHits: Number(row?.cacheHits ?? 0),
  };
}

export function listRecentPlatformChecks(limit = 6) {
  const rows = getDb()
    .prepare(
      `SELECT lat, lon, payload_json, fetched_at, source
       FROM weather_snapshots
       WHERE scope = 'current' AND lat IS NOT NULL AND lon IS NOT NULL
       ORDER BY fetched_at DESC
       LIMIT 50`,
    )
    .all();

  const seen = new Set();
  const checks = [];

  for (const row of rows) {
    const key = `${Number(row.lat).toFixed(4)},${Number(row.lon).toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const payload = JSON.parse(row.payload_json);
    checks.push({
      lat: row.lat,
      lon: row.lon,
      fetchedAt: row.fetched_at,
      source: row.source,
      temperature: payload.temperature,
      description: payload.description,
      condition: payload.condition,
      icon: payload.icon,
      cityName: payload.city ?? null,
      country: payload.country ?? null,
    });

    if (checks.length >= limit) break;
  }

  return checks;
}
