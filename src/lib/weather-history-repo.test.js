import { beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS weather_observations (
  id TEXT PRIMARY KEY,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  observed_at TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  UNIQUE(lat, lon, observed_at)
);

CREATE TABLE IF NOT EXISTS weather_forecast_archive (
  id TEXT PRIMARY KEY,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  scope TEXT NOT NULL,
  valid_at TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  UNIQUE(lat, lon, scope, valid_at, issued_at)
);
`;

const memoryDb = new Database(':memory:');
memoryDb.exec(SCHEMA);

vi.mock('@/lib/db', () => ({
  getDb: () => memoryDb,
}));

import {
  getWeatherHistorySummary,
  listWeatherObservations,
  recordForecastArchive,
  recordWeatherObservation,
} from '@/lib/weather-history-repo';

describe('weather-history-repo', () => {
  beforeEach(() => {
    memoryDb.exec('DELETE FROM weather_observations');
    memoryDb.exec('DELETE FROM weather_forecast_archive');
  });

  it('records and lists current observations', () => {
    recordWeatherObservation(54.5, -3.1, {
      scope: 'current',
      updatedAt: 1_700_000_000,
      temperature: 12,
      description: 'Cloudy',
    });

    const rows = listWeatherObservations(54.5, -3.1);
    expect(rows).toHaveLength(1);
    expect(rows[0].temperature).toBe(12);
    expect(getWeatherHistorySummary(54.5, -3.1).observationCount).toBe(1);
  });

  it('archives forecast points by scope', () => {
    recordForecastArchive(
      54.5,
      -3.1,
      'hourly',
      {
        points: [{ dt: 1_700_000_000, temp: 11, description: 'Rain' }],
      },
      '2026-07-09T12:00:00.000Z',
    );

    const rows = memoryDb
      .prepare('SELECT scope, payload_json FROM weather_forecast_archive WHERE lat = ? AND lon = ?')
      .all(54.5, -3.1);

    expect(rows).toHaveLength(1);
    expect(rows[0].scope).toBe('hourly');
    expect(JSON.parse(rows[0].payload_json).temp).toBe(11);
  });
});
