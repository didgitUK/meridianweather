import { v4 as uuidv4 } from 'uuid';
import {
  WEATHER_CHECK_CACHE_OUTCOMES,
  WEATHER_CHECK_TRIGGERS,
  normalizeWeatherCheckTrigger,
} from '@/constants/weather-check-triggers';
import { buildCityId } from '@/lib/utils';
import { revalidateIndexableCityPaths } from '@/lib/city-indexing';
import { getDb } from '@/lib/db';
import { getPlatformSettings } from '@/lib/platform-settings';

function roundCoord(value) {
  return Number(Number(value).toFixed(4));
}

function buildLocationKey(lat, lon) {
  return `${roundCoord(lat)},${roundCoord(lon)}`;
}

function composeLocationLabel(name, state, country, fallback) {
  const composed = [name, state, country].filter(Boolean).join(', ');

  if (composed) {
    return composed;
  }

  return fallback ?? null;
}

export function locationToCityRecord(location) {
  if (!location?.name || !location?.country || location.lat == null || location.lon == null) {
    return null;
  }

  const slug = location.citySlug ?? buildCityId(location.name, location.country, location.lat);

  return {
    id: slug,
    name: location.name,
    country: location.country,
    state: location.state ?? null,
    lat: location.lat,
    lon: location.lon,
  };
}

export function findLocationByCoords(lat, lon) {
  const roundedLat = roundCoord(lat);
  const roundedLon = roundCoord(lon);

  const row = getDb()
    .prepare('SELECT * FROM locations WHERE lat = ? AND lon = ?')
    .get(roundedLat, roundedLon);

  if (!row) {
    return null;
  }

  return mapLocationRow(row);
}

export function findLocationByCitySlug(citySlug) {
  const row = getDb()
    .prepare('SELECT * FROM locations WHERE city_slug = ?')
    .get(citySlug);

  if (!row) {
    return null;
  }

  return mapLocationRow(row);
}

export function findLocationByLatCountry(lat, country) {
  const row = getDb()
    .prepare('SELECT * FROM locations WHERE lat = ? AND country = ?')
    .get(roundCoord(lat), country.toUpperCase());

  if (!row) {
    return null;
  }

  return mapLocationRow(row);
}

export function findOrCreateLocation(lat, lon, metadata = {}) {
  const existing = findLocationByCoords(lat, lon);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const roundedLat = roundCoord(lat);
  const roundedLon = roundCoord(lon);
  const id = uuidv4();
  const name = metadata.name ?? null;
  const country = metadata.country ?? null;
  const state = metadata.state ?? null;
  const label = metadata.label ?? composeLocationLabel(name, state, country, null);

  getDb()
    .prepare(
      `INSERT INTO locations (id, lat, lon, name, country, state, label, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, roundedLat, roundedLon, name, country, state, label, now, now);

  return findLocationByCoords(roundedLat, roundedLon);
}

export function touchLocation(locationId, metadata = {}) {
  const now = new Date().toISOString();
  const current = getDb().prepare('SELECT * FROM locations WHERE id = ?').get(locationId);

  if (!current) {
    return null;
  }

  const name = metadata.name ?? current.name;
  const country = metadata.country ?? current.country;
  const state = metadata.state ?? current.state;
  const label = metadata.label ?? composeLocationLabel(name, state, country, current.label);

  getDb()
    .prepare(
      `UPDATE locations
       SET name = ?, country = ?, state = ?, label = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(name, country, state, label, now, locationId);

  return getDb().prepare('SELECT * FROM locations WHERE id = ?').get(locationId);
}

export function markLocationIndexable(locationId) {
  const row = getDb().prepare('SELECT * FROM locations WHERE id = ?').get(locationId);

  if (!row?.name || !row?.country || row.lat == null || row.lon == null) {
    return null;
  }

  const slug = buildCityId(row.name, row.country, row.lat);
  const now = new Date().toISOString();
  const isNew = !row.indexable_at;

  getDb()
    .prepare(
      `UPDATE locations
       SET city_slug = ?, indexable_at = COALESCE(indexable_at, ?), updated_at = ?
       WHERE id = ?`,
    )
    .run(slug, now, now, locationId);

  if (isNew) {
    revalidateIndexableCityPaths(slug);
  }

  return { slug, isNew };
}

export function recordLocationWeatherCheck(
  locationId,
  scope,
  payload,
  source,
  recordedAt = new Date().toISOString(),
  options = {},
) {
  if (!locationId || payload?.updatedAt == null) {
    return null;
  }

  const observedAt = new Date(payload.updatedAt * 1000).toISOString();
  const trigger = normalizeWeatherCheckTrigger(options.trigger);
  const cacheOutcome = options.cacheOutcome ?? WEATHER_CHECK_CACHE_OUTCOMES.upstream;
  const tokensUsed = Number.isFinite(options.tokensUsed)
    ? Math.max(0, Math.trunc(options.tokensUsed))
    : (cacheOutcome === WEATHER_CHECK_CACHE_OUTCOMES.upstream ? 1 : 0);

  getDb()
    .prepare(
      `INSERT INTO location_weather_checks (
         id, location_id, scope, observed_at, recorded_at, payload_json, source,
         "trigger", cache_outcome, tokens_used
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      uuidv4(),
      locationId,
      scope,
      observedAt,
      recordedAt,
      JSON.stringify(payload),
      source,
      trigger,
      cacheOutcome,
      tokensUsed,
    );

  touchLocation(locationId, {
    name: payload.city ?? payload.name,
    country: payload.country,
    state: payload.state,
  });

  if (scope === 'current') {
    markLocationIndexable(locationId);
  }

  return observedAt;
}

/**
 * Record a served current-weather check (upstream or cache) against a location.
 */
export function recordServedWeatherCheck({
  lat,
  lon,
  scope,
  payload,
  source,
  trigger = WEATHER_CHECK_TRIGGERS.unknown,
  cacheOutcome = WEATHER_CHECK_CACHE_OUTCOMES.upstream,
  tokensUsed,
  recordedAt = new Date().toISOString(),
}) {
  if (scope !== 'current' || payload?.updatedAt == null) {
    return null;
  }

  const location = findOrCreateLocation(lat, lon, {
    name: payload.city ?? payload.name,
    country: payload.country,
    state: payload.state,
  });

  return recordLocationWeatherCheck(
    location.id,
    scope,
    payload,
    source ?? 'unknown',
    recordedAt,
    { trigger, cacheOutcome, tokensUsed },
  );
}

export function listIndexableCities({ limit = 5000, offset = 0 } = {}) {
  const rows = getDb()
    .prepare(
      `SELECT *
       FROM locations
       WHERE indexable_at IS NOT NULL AND city_slug IS NOT NULL
       ORDER BY indexable_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(limit, offset);

  return rows.map((row) => mapLocationRow(row));
}

export function listLocations({ limit = 50, offset = 0 } = {}) {
  const rows = getDb()
    .prepare(
      `SELECT l.*, COUNT(c.id) AS check_count, MAX(c.observed_at) AS latest_observed_at
       FROM locations l
       LEFT JOIN location_weather_checks c ON c.location_id = l.id
       GROUP BY l.id
       ORDER BY check_count DESC, l.updated_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(limit, offset);

  return rows.map((row) => ({
    ...mapLocationRow(row),
    checkCount: row.check_count,
    latestObservedAt: row.latest_observed_at,
  }));
}

export function listLocationChecks(locationId, { from, to, limit = 500 } = {}) {
  const fromIso = from ?? '1970-01-01T00:00:00.000Z';
  const toIso = to ?? new Date().toISOString();

  const rows = getDb()
    .prepare(
      `SELECT id, observed_at, recorded_at, scope, source, "trigger", cache_outcome, tokens_used, payload_json
       FROM location_weather_checks
       WHERE location_id = ? AND recorded_at >= ? AND recorded_at <= ?
       ORDER BY recorded_at DESC
       LIMIT ?`,
    )
    .all(locationId, fromIso, toIso, limit);

  return rows.map((row) => mapCheckRow(row));
}

export function listPlatformChecks({
  trigger,
  locationId,
  from,
  to,
  upstreamOnly = false,
  limit = 50,
  offset = 0,
} = {}) {
  const fromIso = from ?? '1970-01-01T00:00:00.000Z';
  const toIso = to ?? new Date().toISOString();
  const clauses = ['c.recorded_at >= ?', 'c.recorded_at <= ?'];
  const params = [fromIso, toIso];

  if (locationId) {
    clauses.push('c.location_id = ?');
    params.push(locationId);
  }

  if (trigger && trigger !== 'all') {
    clauses.push('c."trigger" = ?');
    params.push(normalizeWeatherCheckTrigger(trigger));
  }

  if (upstreamOnly) {
    clauses.push('c.cache_outcome = ?');
    params.push(WEATHER_CHECK_CACHE_OUTCOMES.upstream);
  }

  const whereSql = clauses.join(' AND ');
  const countRow = getDb()
    .prepare(
      `SELECT COUNT(*) AS total
       FROM location_weather_checks c
       WHERE ${whereSql}`,
    )
    .get(...params);

  const rows = getDb()
    .prepare(
      `SELECT c.id, c.location_id, c.observed_at, c.recorded_at, c.scope, c.source,
              c."trigger", c.cache_outcome, c.tokens_used, c.payload_json,
              l.lat, l.lon, l.name, l.country, l.state, l.label, l.city_slug
       FROM location_weather_checks c
       INNER JOIN locations l ON l.id = c.location_id
       WHERE ${whereSql}
       ORDER BY c.recorded_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset);

  return {
    total: countRow?.total ?? 0,
    checks: rows.map((row) => ({
      ...mapCheckRow(row),
      locationId: row.location_id,
      lat: row.lat,
      lon: row.lon,
      cityName: row.name,
      country: row.country,
      state: row.state,
      label: row.label,
      citySlug: row.city_slug,
    })),
  };
}

export function getLocationSummary(locationId) {
  const location = getDb().prepare('SELECT * FROM locations WHERE id = ?').get(locationId);
  if (!location) {
    return null;
  }

  const stats = getDb()
    .prepare(
      `SELECT COUNT(*) AS check_count, MIN(observed_at) AS oldest_observed_at, MAX(observed_at) AS newest_observed_at
       FROM location_weather_checks
       WHERE location_id = ?`,
    )
    .get(locationId);

  return {
    ...mapLocationRow(location),
    checkCount: stats?.check_count ?? 0,
    oldestObservedAt: stats?.oldest_observed_at ?? null,
    newestObservedAt: stats?.newest_observed_at ?? null,
  };
}

function mapLocationRow(row) {
  return {
    id: row.id,
    lat: row.lat,
    lon: row.lon,
    name: row.name,
    country: row.country,
    state: row.state,
    label: row.label,
    citySlug: row.city_slug ?? null,
    indexableAt: row.indexable_at ?? null,
    inaccurateReportActive: Boolean(row.inaccurate_report_active),
    inaccurateReportedAt: row.inaccurate_reported_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCheckRow(row) {
  const payload = JSON.parse(row.payload_json);

  return {
    id: row.id ?? null,
    observedAt: row.observed_at,
    recordedAt: row.recorded_at,
    scope: row.scope,
    source: row.source,
    provider: row.source,
    trigger: row.trigger ?? WEATHER_CHECK_TRIGGERS.unknown,
    cacheOutcome: row.cache_outcome ?? WEATHER_CHECK_CACHE_OUTCOMES.upstream,
    tokensUsed: row.tokens_used ?? 0,
    ...payload,
  };
}

export function getInaccurateReportStatus(lat, lon) {
  applyInaccuracyAutoDismiss();

  const location = findLocationByCoords(lat, lon);

  if (!location) {
    return { active: false, reportedAt: null };
  }

  return {
    active: location.inaccurateReportActive,
    reportedAt: location.inaccurateReportedAt,
  };
}

export function activateInaccurateReport(lat, lon, metadata = {}) {
  const location = findOrCreateLocation(lat, lon, metadata);
  const now = new Date().toISOString();

  getDb()
    .prepare(
      `UPDATE locations
       SET inaccurate_report_active = 1, inaccurate_reported_at = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(now, now, location.id);

  return getInaccurateReportStatus(lat, lon);
}

export function clearInaccurateReport(locationId) {
  const now = new Date().toISOString();

  getDb()
    .prepare(
      `UPDATE locations
       SET inaccurate_report_active = 0, inaccurate_reported_at = NULL, updated_at = ?
       WHERE id = ?`,
    )
    .run(now, locationId);

  return getLocationSummary(locationId);
}

function getAutoDismissCutoffIso() {
  const settings = getPlatformSettings();

  if (!settings.inaccuracyAutoDismissEnabled) {
    return null;
  }

  const days = Number(settings.inaccuracyAutoDismissDays);
  if (!Number.isFinite(days) || days < 1) {
    return null;
  }

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  return cutoff.toISOString();
}

export function applyInaccuracyAutoDismiss() {
  const cutoffIso = getAutoDismissCutoffIso();
  if (!cutoffIso) {
    return 0;
  }

  const now = new Date().toISOString();
  const result = getDb()
    .prepare(
      `UPDATE locations
       SET inaccurate_report_active = 0, inaccurate_reported_at = NULL, updated_at = ?
       WHERE inaccurate_report_active = 1
         AND inaccurate_reported_at IS NOT NULL
         AND inaccurate_reported_at <= ?`,
    )
    .run(now, cutoffIso);

  return result.changes ?? 0;
}

export function listInaccurateReports({ limit = 200 } = {}) {
  applyInaccuracyAutoDismiss();

  const rows = getDb()
    .prepare(
      `SELECT *
       FROM locations
       WHERE inaccurate_report_active = 1
       ORDER BY COALESCE(inaccurate_reported_at, created_at) ASC
       LIMIT ?`,
    )
    .all(limit);

  return rows.map((row) => mapLocationRow(row));
}

export function listRecentLocationChecks(limit = 20) {
  const rows = getDb()
    .prepare(
      `SELECT l.id, l.lat, l.lon, l.name, l.country, l.state, l.label, l.city_slug,
              c.observed_at, c.recorded_at, c.source, c."trigger", c.cache_outcome,
              c.tokens_used, c.payload_json
       FROM locations l
       INNER JOIN location_weather_checks c ON c.location_id = l.id AND c.scope = 'current'
       ORDER BY c.recorded_at DESC
       LIMIT 100`,
    )
    .all();

  const seen = new Set();
  const checks = [];

  for (const row of rows) {
    const key = buildLocationKey(row.lat, row.lon);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    const payload = JSON.parse(row.payload_json);

    checks.push({
      locationId: row.id,
      lat: row.lat,
      lon: row.lon,
      fetchedAt: row.observed_at,
      recordedAt: row.recorded_at,
      source: row.source,
      trigger: row.trigger ?? WEATHER_CHECK_TRIGGERS.unknown,
      cacheOutcome: row.cache_outcome ?? WEATHER_CHECK_CACHE_OUTCOMES.upstream,
      tokensUsed: row.tokens_used ?? 0,
      temperature: payload.temperature,
      description: payload.description,
      condition: payload.condition,
      icon: payload.icon,
      cityName: row.name ?? payload.city ?? null,
      country: row.country ?? payload.country ?? null,
      label: row.label,
      citySlug: row.city_slug,
    });

    if (checks.length >= limit) {
      break;
    }
  }

  return checks;
}
