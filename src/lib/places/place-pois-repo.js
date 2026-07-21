import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';

function mapPoiRow(row) {
  if (!row) {
    return null;
  }

  let tags = {};
  try {
    tags = JSON.parse(row.tags_json || '{}');
  } catch {
    tags = {};
  }

  return {
    id: row.id,
    placeSlug: row.place_slug,
    category: row.category,
    name: row.name,
    lat: row.lat,
    lon: row.lon,
    osmId: row.osm_id,
    tags,
    fetchedAt: row.fetched_at,
  };
}

/**
 * @param {string} placeSlug
 */
export function listPlacePois(placeSlug, options = {}) {
  const category = options.category ?? null;
  const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 200);

  if (category) {
    return getDb()
      .prepare(
        `SELECT id, place_slug, category, name, lat, lon, osm_id, tags_json, fetched_at
         FROM place_pois
         WHERE place_slug = ? AND category = ?
         ORDER BY name ASC
         LIMIT ?`,
      )
      .all(placeSlug, category, limit)
      .map(mapPoiRow);
  }

  return getDb()
    .prepare(
      `SELECT id, place_slug, category, name, lat, lon, osm_id, tags_json, fetched_at
       FROM place_pois
       WHERE place_slug = ?
       ORDER BY category ASC, name ASC
       LIMIT ?`,
    )
    .all(placeSlug, limit)
    .map(mapPoiRow);
}

/**
 * @param {string} placeSlug
 */
export function getPlacePoisFetchedAt(placeSlug) {
  const row = getDb()
    .prepare(
      `SELECT fetched_at FROM place_pois
       WHERE place_slug = ?
       ORDER BY fetched_at DESC
       LIMIT 1`,
    )
    .get(placeSlug);

  return row?.fetched_at ?? null;
}

/**
 * Replace all POIs for a place in one transaction.
 * @param {string} placeSlug
 * @param {Array<{
 *   category: string,
 *   name: string,
 *   lat: number,
 *   lon: number,
 *   osmId?: string | null,
 *   tags?: Record<string, string>,
 * }>} pois
 */
export function replacePlacePois(placeSlug, pois) {
  const db = getDb();
  const now = new Date().toISOString();
  const deleteStmt = db.prepare('DELETE FROM place_pois WHERE place_slug = ?');
  const insertStmt = db.prepare(
    `INSERT INTO place_pois (
       id, place_slug, category, name, lat, lon, osm_id, tags_json, fetched_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const run = db.transaction((rows) => {
    deleteStmt.run(placeSlug);
    for (const poi of rows) {
      insertStmt.run(
        uuidv4(),
        placeSlug,
        poi.category,
        poi.name,
        poi.lat,
        poi.lon,
        poi.osmId ?? null,
        JSON.stringify(poi.tags ?? {}),
        now,
      );
    }
  });

  run(pois);
  return listPlacePois(placeSlug);
}

/**
 * @param {string} placeSlug
 */
export function countPlacePois(placeSlug) {
  const row = getDb()
    .prepare('SELECT COUNT(*) AS count FROM place_pois WHERE place_slug = ?')
    .get(placeSlug);
  return Number(row?.count ?? 0);
}
