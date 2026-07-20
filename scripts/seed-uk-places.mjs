#!/usr/bin/env node
/**
 * Seed UK places (Phase A + B) into SQLite.
 * Usage: npm run seed:uk-places
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildCityId(name, country, lat) {
  return `${slugify(name)}-${country}-${Number(lat).toFixed(4)}`;
}

function resolveDatabasePath() {
  const configured = process.env.DATABASE_PATH?.trim();
  if (!configured) {
    return path.join(root, 'data', 'meridian.db');
  }

  return path.isAbsolute(configured) ? configured : path.join(root, configured);
}

async function main() {
  const phaseAModule = await import(
    pathToFileURL(path.join(root, 'src/constants/uk-places-phase-a.js')).href
  );
  const phaseBModule = await import(
    pathToFileURL(path.join(root, 'src/constants/uk-places-phase-b.js')).href
  );
  const places = [
    ...phaseAModule.UK_PLACES_PHASE_A,
    ...phaseBModule.UK_PLACES_PHASE_B,
  ];
  const dbPath = resolveDatabasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS uk_places (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'GB',
      admin_area TEXT,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      population INTEGER NOT NULL DEFAULT 0,
      place_type TEXT NOT NULL DEFAULT 'town',
      tier INTEGER NOT NULL DEFAULT 1,
      city_slug TEXT,
      view_count INTEGER NOT NULL DEFAULT 0,
      last_viewed_at TEXT,
      last_fetched_at TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_uk_places_population ON uk_places(population DESC);
    CREATE INDEX IF NOT EXISTS idx_uk_places_tier_population ON uk_places(tier, population DESC);
    CREATE INDEX IF NOT EXISTS idx_uk_places_city_slug ON uk_places(city_slug);
    CREATE INDEX IF NOT EXISTS idx_uk_places_view_count ON uk_places(view_count DESC);
  `);

  for (const statement of [
    'ALTER TABLE uk_places ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0',
    'ALTER TABLE uk_places ADD COLUMN last_viewed_at TEXT',
    'ALTER TABLE uk_places ADD COLUMN last_fetched_at TEXT',
  ]) {
    try {
      db.exec(statement);
    } catch {
      // Column exists.
    }
  }

  const existing = new Set(
    db.prepare('SELECT slug FROM uk_places').all().map((row) => row.slug),
  );
  const upsert = db.prepare(
    `INSERT INTO uk_places (
       id, slug, name, country, admin_area, lat, lon, population, place_type, tier, city_slug,
       view_count, last_viewed_at, last_fetched_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, NULL, ?)
     ON CONFLICT(slug) DO UPDATE SET
       name = excluded.name,
       country = excluded.country,
       admin_area = excluded.admin_area,
       lat = excluded.lat,
       lon = excluded.lon,
       population = excluded.population,
       place_type = excluded.place_type,
       tier = excluded.tier,
       city_slug = excluded.city_slug,
       updated_at = excluded.updated_at`,
  );

  const now = new Date().toISOString();
  let inserted = 0;
  let updated = 0;

  const run = db.transaction((rows) => {
    for (const place of rows) {
      const citySlug = buildCityId(place.name, place.country, place.lat);
      const wasExisting = existing.has(place.slug);
      upsert.run(
        place.slug,
        place.slug,
        place.name,
        place.country,
        place.adminArea ?? null,
        place.lat,
        place.lon,
        place.population ?? 0,
        place.placeType ?? 'town',
        place.tier ?? 1,
        citySlug,
        now,
      );
      if (wasExisting) updated += 1;
      else inserted += 1;
    }
  });

  run(places);
  const total = db.prepare('SELECT COUNT(*) AS count FROM uk_places').get().count;
  db.close();
  console.log(`UK places seed complete: inserted=${inserted} updated=${updated} total=${total}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
