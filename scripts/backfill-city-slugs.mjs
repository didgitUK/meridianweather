import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

function ensureColumns(db) {
  const migrations = [
    'ALTER TABLE locations ADD COLUMN city_slug TEXT',
    'ALTER TABLE locations ADD COLUMN indexable_at TEXT',
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_city_slug ON locations(city_slug)',
    'CREATE INDEX IF NOT EXISTS idx_locations_indexable ON locations(indexable_at DESC)',
  ];

  for (const statement of migrations) {
    try {
      db.exec(statement);
    } catch {
      // Already applied.
    }
  }
}

const dbPath = resolveDatabasePath();
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);

ensureColumns(db);

const rows = db
  .prepare(
    `SELECT id, lat, lon, name, country
     FROM locations
     WHERE name IS NOT NULL AND country IS NOT NULL`,
  )
  .all();

const now = new Date().toISOString();
let updated = 0;

for (const row of rows) {
  const slug = buildCityId(row.name, row.country, row.lat);
  const result = db
    .prepare(
      `UPDATE locations
       SET city_slug = ?, indexable_at = COALESCE(indexable_at, ?), updated_at = ?
       WHERE id = ?`,
    )
    .run(slug, now, now, row.id);

  updated += result.changes;
}

console.log(`Backfilled ${updated} location row(s) in ${dbPath}`);
