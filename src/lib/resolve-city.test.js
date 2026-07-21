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

CREATE TABLE IF NOT EXISTS uk_places (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  admin_area TEXT,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  population INTEGER,
  place_type TEXT,
  tier INTEGER NOT NULL DEFAULT 3,
  city_slug TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TEXT,
  last_fetched_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_uk_places_city_slug ON uk_places(city_slug);
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
    memoryDb.exec('DELETE FROM uk_places');
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

  it('resolves UK inventory by city_slug without a locations row', () => {
    const now = new Date().toISOString();
    memoryDb
      .prepare(
        `INSERT INTO uk_places (
          id, slug, name, country, admin_area, lat, lon, population, place_type, tier, city_slug, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        'carlisle',
        'carlisle',
        'Carlisle',
        'GB',
        'England',
        54.8951,
        -2.9382,
        75000,
        'city',
        2,
        'carlisle-GB-54.8951',
        now,
        now,
      );

    expect(resolveCity('carlisle-GB-54.8951')).toMatchObject({
      name: 'Carlisle',
      country: 'GB',
      lat: 54.8951,
      lon: -2.9382,
      seoSlug: 'carlisle',
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
