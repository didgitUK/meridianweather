import { v4 as uuidv4 } from 'uuid';
import { PLACE_LOCAL_LINKS_MAX } from '@/constants/place-content';
import { getDb } from '@/lib/db';

function mapLinkRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    placeSlug: row.place_slug,
    title: row.title,
    url: row.url,
    publisher: row.publisher,
    publishedAt: row.published_at,
    fetchedAt: row.fetched_at,
  };
}

/**
 * @param {string} placeSlug
 * @param {{ limit?: number }} [options]
 */
export function listPlaceLocalLinks(placeSlug, options = {}) {
  const limit = Math.min(
    Math.max(Number(options.limit) || PLACE_LOCAL_LINKS_MAX, 1),
    PLACE_LOCAL_LINKS_MAX,
  );

  return getDb()
    .prepare(
      `SELECT id, place_slug, title, url, publisher, published_at, fetched_at
       FROM place_local_links
       WHERE place_slug = ?
       ORDER BY published_at DESC, fetched_at DESC
       LIMIT ?`,
    )
    .all(placeSlug, limit)
    .map(mapLinkRow);
}

/**
 * @param {string} placeSlug
 */
export function getPlaceLocalLinksFetchedAt(placeSlug) {
  const row = getDb()
    .prepare(
      `SELECT fetched_at FROM place_local_links
       WHERE place_slug = ?
       ORDER BY fetched_at DESC
       LIMIT 1`,
    )
    .get(placeSlug);

  return row?.fetched_at ?? null;
}

/**
 * @param {string} placeSlug
 * @param {Array<{ title: string, url: string, publisher?: string | null, publishedAt?: string | null }>} links
 */
export function replacePlaceLocalLinks(placeSlug, links) {
  const db = getDb();
  const now = new Date().toISOString();
  const deleteStmt = db.prepare('DELETE FROM place_local_links WHERE place_slug = ?');
  const insertStmt = db.prepare(
    `INSERT INTO place_local_links (
       id, place_slug, title, url, publisher, published_at, fetched_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );

  const capped = links.slice(0, PLACE_LOCAL_LINKS_MAX);

  const run = db.transaction((rows) => {
    deleteStmt.run(placeSlug);
    for (const link of rows) {
      insertStmt.run(
        uuidv4(),
        placeSlug,
        link.title,
        link.url,
        link.publisher ?? null,
        link.publishedAt ?? null,
        now,
      );
    }
  });

  run(capped);
  return listPlaceLocalLinks(placeSlug);
}
