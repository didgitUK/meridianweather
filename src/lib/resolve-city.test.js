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
`;

const memoryDb = new Database(':memory:');
memoryDb.exec(SCHEMA);

vi.mock('@/lib/db', () => ({
  getDb: () => memoryDb,
}));

vi.mock('@/lib/city-indexing', () => ({
  revalidateIndexableCityPaths: vi.fn(),
}));

import { findOrCreateLocation, markLocationIndexable } from '@/lib/location-repo';
import { getShowcaseCities, resolveCity } from '@/lib/resolve-city';

describe('resolveCity', () => {
  beforeEach(() => {
    memoryDb.exec('DELETE FROM locations');
  });

  it('resolves showcase cities with coordinates', () => {
    const city = resolveCity('london-GB-51.5073');
    expect(city).toMatchObject({
      name: 'London',
      country: 'GB',
      lat: 51.5073,
      lon: -0.1276,
    });
  });

  it('resolves indexed cities from the database by slug', () => {
    const location = findOrCreateLocation(53.4808, -2.2426, {
      name: 'Manchester',
      country: 'GB',
    });
    markLocationIndexable(location.id);

    expect(resolveCity('manchester-GB-53.4808')).toMatchObject({
      name: 'Manchester',
      country: 'GB',
      lat: 53.4808,
      lon: -2.2426,
    });
  });

  it('resolves indexed cities from lat and country when slug is parsed', () => {
    const location = findOrCreateLocation(53.4808, -2.2426, {
      name: 'Manchester',
      country: 'GB',
    });
    markLocationIndexable(location.id);

    expect(resolveCity('manchester-GB-53.4808')).toMatchObject({
      lon: -2.2426,
    });
  });

  it('returns null for invalid ids without a database match', () => {
    expect(resolveCity('not-a-city')).toBeNull();
    expect(resolveCity('manchester-GB-53.4808')).toBeNull();
  });

  it('lists showcase cities', () => {
    expect(getShowcaseCities()).toHaveLength(5);
  });
});
