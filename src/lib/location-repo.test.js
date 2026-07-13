import { beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  name TEXT,
  country TEXT,
  state TEXT,
  label TEXT,
  city_slug TEXT,
  indexable_at TEXT,
  inaccurate_report_active INTEGER NOT NULL DEFAULT 0,
  inaccurate_reported_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(lat, lon)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_city_slug ON locations(city_slug);
CREATE INDEX IF NOT EXISTS idx_locations_indexable ON locations(indexable_at DESC);

CREATE TABLE IF NOT EXISTS location_weather_checks (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL,
  scope TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  source TEXT NOT NULL,
  "trigger" TEXT NOT NULL DEFAULT 'unknown',
  cache_outcome TEXT NOT NULL DEFAULT 'upstream',
  tokens_used INTEGER NOT NULL DEFAULT 1
);
`;

const memoryDb = new Database(':memory:');
memoryDb.exec(SCHEMA);

vi.mock('@/lib/db', () => ({
  getDb: () => memoryDb,
}));

vi.mock('@/lib/city-indexing', () => ({
  revalidateIndexableCityPaths: vi.fn(),
}));

vi.mock('@/lib/platform-settings', () => ({
  getPlatformSettings: () => ({
    inaccuracyAutoDismissEnabled: false,
    inaccuracyAutoDismissDays: 7,
  }),
}));

import {
  activateInaccurateReport,
  clearInaccurateReport,
  findLocationByCitySlug,
  findOrCreateLocation,
  getInaccurateReportStatus,
  listInaccurateReports,
  listIndexableCities,
  listLocationChecks,
  listLocations,
  markLocationIndexable,
  recordLocationWeatherCheck,
} from '@/lib/location-repo';

describe('location-repo', () => {
  beforeEach(() => {
    memoryDb.exec('DELETE FROM location_weather_checks');
    memoryDb.exec('DELETE FROM locations');
  });

  it('creates a parent location and appends child checks', () => {
    const location = findOrCreateLocation(54.5, -3.1, {
      name: 'Carlisle',
      country: 'GB',
    });

    recordLocationWeatherCheck(
      location.id,
      'current',
      { scope: 'current', updatedAt: 1_700_000_000, temperature: 12, city: 'Carlisle', country: 'GB' },
      'onecall_current',
    );
    recordLocationWeatherCheck(
      location.id,
      'current',
      { scope: 'current', updatedAt: 1_700_003_600, temperature: 13, city: 'Carlisle', country: 'GB' },
      'onecall_current',
    );

    const checks = listLocationChecks(location.id);
    expect(checks).toHaveLength(2);
    expect(findOrCreateLocation(54.5, -3.1).id).toBe(location.id);
  });

  it('marks a location indexable with a stable city slug', () => {
    const location = findOrCreateLocation(53.4808, -2.2426, {
      name: 'Manchester',
      country: 'GB',
    });

    const first = markLocationIndexable(location.id);
    const second = markLocationIndexable(location.id);

    expect(first).toEqual({
      slug: 'manchester-GB-53.4808',
      isNew: true,
    });
    expect(second).toEqual({
      slug: 'manchester-GB-53.4808',
      isNew: false,
    });
    expect(findLocationByCitySlug('manchester-GB-53.4808')?.name).toBe('Manchester');
    expect(listIndexableCities()).toHaveLength(1);
  });

  it('indexes a location on the first current weather check', () => {
    const location = findOrCreateLocation(53.4808, -2.2426, {
      name: 'Manchester',
      country: 'GB',
    });

    recordLocationWeatherCheck(
      location.id,
      'current',
      { scope: 'current', updatedAt: 1_700_000_000, temperature: 11, city: 'Manchester', country: 'GB' },
      'onecall_current',
    );

    expect(listIndexableCities()[0]?.citySlug).toBe('manchester-GB-53.4808');
  });

  it('activates and clears inaccurate report banners by location', () => {
    const location = findOrCreateLocation(54.5, -3.1, { name: 'Carlisle', country: 'GB' });

    expect(getInaccurateReportStatus(54.5, -3.1).active).toBe(false);

    const activated = activateInaccurateReport(54.5, -3.1, { name: 'Carlisle', country: 'GB' });

    expect(activated.active).toBe(true);
    expect(activated.reportedAt).toBeTruthy();

    const cleared = clearInaccurateReport(location.id);

    expect(cleared.inaccurateReportActive).toBe(false);
    expect(getInaccurateReportStatus(54.5, -3.1).active).toBe(false);
  });

  it('lists inaccurate reports oldest first', () => {
    activateInaccurateReport(51.5, -0.1, { name: 'London', country: 'GB' });
    memoryDb
      .prepare('UPDATE locations SET inaccurate_reported_at = ? WHERE lat = ? AND lon = ?')
      .run('2026-01-01T00:00:00.000Z', 51.5, -0.1);

    activateInaccurateReport(53.5, -2.2, { name: 'Manchester', country: 'GB' });
    memoryDb
      .prepare('UPDATE locations SET inaccurate_reported_at = ? WHERE lat = ? AND lon = ?')
      .run('2026-06-01T00:00:00.000Z', 53.5, -2.2);

    const reports = listInaccurateReports();

    expect(reports.map((report) => report.name)).toEqual(['London', 'Manchester']);
  });

  it('lists locations with highest check counts first', () => {
    const low = findOrCreateLocation(54.5, -3.1, { name: 'Carlisle', country: 'GB' });
    const high = findOrCreateLocation(53.48, -2.24, { name: 'Manchester', country: 'GB' });

    recordLocationWeatherCheck(
      low.id,
      'current',
      { scope: 'current', updatedAt: 1_700_000_000, temperature: 10, city: 'Carlisle', country: 'GB' },
      'onecall_current',
    );

    recordLocationWeatherCheck(
      high.id,
      'current',
      { scope: 'current', updatedAt: 1_700_000_100, temperature: 11, city: 'Manchester', country: 'GB' },
      'onecall_current',
    );
    recordLocationWeatherCheck(
      high.id,
      'current',
      { scope: 'current', updatedAt: 1_700_000_200, temperature: 12, city: 'Manchester', country: 'GB' },
      'onecall_current',
    );

    const locations = listLocations();

    expect(locations[0]?.name).toBe('Manchester');
    expect(locations[0]?.checkCount).toBe(2);
  });

  it('records trigger, cache outcome, and tokens on each check', () => {
    const location = findOrCreateLocation(54.5, -3.1, {
      name: 'Carlisle',
      country: 'GB',
    });

    recordLocationWeatherCheck(
      location.id,
      'current',
      { scope: 'current', updatedAt: 1_700_000_000, temperature: 12, city: 'Carlisle', country: 'GB' },
      'onecall_current',
      '2026-07-12T10:00:00.000Z',
      {
        trigger: 'dashboard_load',
        cacheOutcome: 'upstream',
        tokensUsed: 1,
      },
    );
    recordLocationWeatherCheck(
      location.id,
      'current',
      { scope: 'current', updatedAt: 1_700_000_000, temperature: 12, city: 'Carlisle', country: 'GB' },
      'onecall_current',
      '2026-07-12T10:05:00.000Z',
      {
        trigger: 'dashboard_load',
        cacheOutcome: 'memory',
        tokensUsed: 0,
      },
    );

    const checks = listLocationChecks(location.id);

    expect(checks).toHaveLength(2);
    expect(checks[0]).toMatchObject({
      trigger: 'dashboard_load',
      cacheOutcome: 'memory',
      tokensUsed: 0,
      provider: 'onecall_current',
    });
    expect(checks[1]).toMatchObject({
      trigger: 'dashboard_load',
      cacheOutcome: 'upstream',
      tokensUsed: 1,
    });
  });
});
