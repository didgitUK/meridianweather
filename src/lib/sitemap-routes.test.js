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
import { getCitySitemapEntries } from '@/lib/sitemap-routes';

describe('sitemap-routes', () => {
  beforeEach(() => {
    memoryDb.exec('DELETE FROM locations');
  });

  it('includes showcase and database-backed city paths', () => {
    const location = findOrCreateLocation(53.4808, -2.2426, {
      name: 'Manchester',
      country: 'GB',
    });
    markLocationIndexable(location.id);

    const paths = getCitySitemapEntries().map((entry) => entry.path);

    expect(paths).toContain('/city/london-GB-51.5073');
    expect(paths).toContain('/city/manchester-GB-53.4808');
  });
});
