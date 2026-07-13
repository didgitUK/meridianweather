import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { WEATHER_HISTORY_RETENTION_MS } from '@/constants/weather-history';

function roundCoord(value) {
  return Number(Number(value).toFixed(4));
}

function purgeExpiredHistory() {
  const cutoff = new Date(Date.now() - WEATHER_HISTORY_RETENTION_MS).toISOString();

  getDb().prepare('DELETE FROM weather_observations WHERE recorded_at < ?').run(cutoff);
  getDb().prepare('DELETE FROM weather_forecast_archive WHERE issued_at < ?').run(cutoff);
}

export function recordWeatherObservation(lat, lon, payload, recordedAt = new Date().toISOString()) {
  if (payload?.scope !== 'current' || payload.updatedAt == null) {
    return;
  }

  const roundedLat = roundCoord(lat);
  const roundedLon = roundCoord(lon);
  const observedAt = new Date(payload.updatedAt * 1000).toISOString();

  getDb()
    .prepare(
      `INSERT INTO weather_observations (id, lat, lon, observed_at, recorded_at, payload_json)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(lat, lon, observed_at) DO UPDATE SET
         recorded_at = excluded.recorded_at,
         payload_json = excluded.payload_json`,
    )
    .run(uuidv4(), roundedLat, roundedLon, observedAt, recordedAt, JSON.stringify(payload));

  purgeExpiredHistory();
}

export function recordForecastArchive(lat, lon, scope, payload, issuedAt = new Date().toISOString()) {
  if (!['hourly', 'daily', 'minutely'].includes(scope) || !Array.isArray(payload?.points)) {
    return;
  }

  const roundedLat = roundCoord(lat);
  const roundedLon = roundCoord(lon);
  const insert = getDb().prepare(
    `INSERT INTO weather_forecast_archive (id, lat, lon, scope, valid_at, issued_at, payload_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(lat, lon, scope, valid_at, issued_at) DO UPDATE SET
       payload_json = excluded.payload_json`,
  );

  for (const point of payload.points) {
    if (point.dt == null) {
      continue;
    }

    insert.run(
      uuidv4(),
      roundedLat,
      roundedLon,
      scope,
      new Date(point.dt * 1000).toISOString(),
      issuedAt,
      JSON.stringify(point),
    );
  }

  purgeExpiredHistory();
}

export function listWeatherObservations(lat, lon, { from, to, limit = 500 } = {}) {
  const roundedLat = roundCoord(lat);
  const roundedLon = roundCoord(lon);
  const retentionCutoff = new Date(Date.now() - WEATHER_HISTORY_RETENTION_MS).toISOString();
  const fromIso = from ?? retentionCutoff;
  const toIso = to ?? new Date().toISOString();

  const rows = getDb()
    .prepare(
      `SELECT observed_at, recorded_at, payload_json
       FROM weather_observations
       WHERE lat = ? AND lon = ? AND observed_at >= ? AND observed_at <= ?
       ORDER BY observed_at DESC
       LIMIT ?`,
    )
    .all(roundedLat, roundedLon, fromIso, toIso, limit);

  return rows.map((row) => ({
    observedAt: row.observed_at,
    recordedAt: row.recorded_at,
    ...JSON.parse(row.payload_json),
  }));
}

export function listForecastArchive(lat, lon, scope, { from, to, limit = 1000 } = {}) {
  const roundedLat = roundCoord(lat);
  const roundedLon = roundCoord(lon);
  const retentionCutoff = new Date(Date.now() - WEATHER_HISTORY_RETENTION_MS).toISOString();
  const fromIso = from ?? retentionCutoff;
  const toIso = to ?? new Date().toISOString();

  const rows = getDb()
    .prepare(
      `SELECT valid_at, issued_at, payload_json
       FROM weather_forecast_archive
       WHERE lat = ? AND lon = ? AND scope = ? AND valid_at >= ? AND valid_at <= ?
       ORDER BY valid_at ASC
       LIMIT ?`,
    )
    .all(roundedLat, roundedLon, scope, fromIso, toIso, limit);

  return rows.map((row) => ({
    validAt: row.valid_at,
    issuedAt: row.issued_at,
    point: JSON.parse(row.payload_json),
  }));
}

export function getWeatherHistorySummary(lat, lon) {
  const roundedLat = roundCoord(lat);
  const roundedLon = roundCoord(lon);

  const observationCount = getDb()
    .prepare('SELECT COUNT(*) as count FROM weather_observations WHERE lat = ? AND lon = ?')
    .get(roundedLat, roundedLon)?.count ?? 0;

  const oldest = getDb()
    .prepare(
      `SELECT observed_at FROM weather_observations
       WHERE lat = ? AND lon = ?
       ORDER BY observed_at ASC LIMIT 1`,
    )
    .get(roundedLat, roundedLon);

  const newest = getDb()
    .prepare(
      `SELECT observed_at FROM weather_observations
       WHERE lat = ? AND lon = ?
       ORDER BY observed_at DESC LIMIT 1`,
    )
    .get(roundedLat, roundedLon);

  return {
    observationCount,
    oldestObservationAt: oldest?.observed_at ?? null,
    newestObservationAt: newest?.observed_at ?? null,
    retentionMonths: 48,
  };
}
