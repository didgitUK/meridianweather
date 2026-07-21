import { v4 as uuidv4 } from 'uuid';
import { PLACE_ARTICLE_STATUS } from '@/constants/place-content';
import { getDb } from '@/lib/db';

function parseSources(raw) {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapArticleRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    placeSlug: row.place_slug,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    bodyHtml: row.body_html,
    wordCount: row.word_count,
    status: row.status,
    sources: parseSources(row.sources_json),
    imageUrl: row.image_url,
    imageCredit: row.image_credit,
    imageSourceUrl: row.image_source_url,
    model: row.model,
    promptVersion: row.prompt_version,
    contextHash: row.context_hash,
    generatedAt: row.generated_at,
    publishedAt: row.published_at,
    lockedByAdmin: Boolean(row.locked_by_admin),
    updatedAt: row.updated_at,
    href: `/weather/${row.place_slug}/guides/${row.slug}`,
    dateIso: row.published_at || row.generated_at,
    dateLabel: formatDateLabel(row.published_at || row.generated_at),
  };
}

function formatDateLabel(iso) {
  if (!iso) {
    return '';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
}

/**
 * @param {string} placeSlug
 * @param {{ status?: string, limit?: number }} [options]
 */
export function listPlaceArticles(placeSlug, options = {}) {
  const status = options.status ?? null;
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);

  if (status) {
    return getDb()
      .prepare(
        `SELECT * FROM place_articles
         WHERE place_slug = ? AND status = ?
         ORDER BY generated_at DESC
         LIMIT ?`,
      )
      .all(placeSlug, status, limit)
      .map(mapArticleRow);
  }

  return getDb()
    .prepare(
      `SELECT * FROM place_articles
       WHERE place_slug = ?
       ORDER BY generated_at DESC
       LIMIT ?`,
    )
    .all(placeSlug, limit)
    .map(mapArticleRow);
}

/**
 * @param {string} placeSlug
 */
export function listPublishedPlaceArticles(placeSlug, options = {}) {
  return listPlaceArticles(placeSlug, {
    ...options,
    status: PLACE_ARTICLE_STATUS.published,
  });
}

/**
 * @param {{ status?: string, limit?: number, offset?: number }} [options]
 */
export function listAllPlaceArticles(options = {}) {
  const status = options.status ?? null;
  const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 500);
  const offset = Math.max(Number(options.offset) || 0, 0);

  if (status) {
    return getDb()
      .prepare(
        `SELECT * FROM place_articles
         WHERE status = ?
         ORDER BY generated_at DESC
         LIMIT ? OFFSET ?`,
      )
      .all(status, limit, offset)
      .map(mapArticleRow);
  }

  return getDb()
    .prepare(
      `SELECT * FROM place_articles
       ORDER BY generated_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(limit, offset)
    .map(mapArticleRow);
}

/**
 * @param {string} placeSlug
 * @param {string} slug
 */
export function getPlaceArticle(placeSlug, slug) {
  const row = getDb()
    .prepare(
      `SELECT * FROM place_articles
       WHERE place_slug = ? AND slug = ?`,
    )
    .get(placeSlug, slug);

  return mapArticleRow(row);
}

/**
 * Published guides for sitemap.
 */
export function listPublishedPlaceArticlePaths() {
  return getDb()
    .prepare(
      `SELECT place_slug, slug, published_at, generated_at, updated_at
       FROM place_articles
       WHERE status = ?
       ORDER BY place_slug ASC, slug ASC`,
    )
    .all(PLACE_ARTICLE_STATUS.published)
    .map((row) => ({
      path: `/weather/${row.place_slug}/guides/${row.slug}`,
      lastModified: new Date(row.updated_at || row.published_at || row.generated_at),
    }));
}

/**
 * @param {{
 *   id?: string,
 *   placeSlug: string,
 *   slug: string,
 *   title: string,
 *   excerpt: string,
 *   category: string,
 *   bodyHtml: string,
 *   wordCount: number,
 *   status: string,
 *   sources?: unknown[],
 *   imageUrl?: string | null,
 *   imageCredit?: string | null,
 *   imageSourceUrl?: string | null,
 *   model?: string | null,
 *   promptVersion?: string | null,
 *   contextHash?: string | null,
 *   publishedAt?: string | null,
 *   lockedByAdmin?: boolean,
 * }} input
 */
export function upsertPlaceArticle(input) {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = getPlaceArticle(input.placeSlug, input.slug);

  if (existing?.lockedByAdmin) {
    return existing;
  }

  const id = existing?.id ?? input.id ?? uuidv4();
  const publishedAt =
    input.status === PLACE_ARTICLE_STATUS.published
      ? (input.publishedAt ?? existing?.publishedAt ?? now)
      : (input.publishedAt ?? null);

  db.prepare(
    `INSERT INTO place_articles (
       id, place_slug, slug, title, excerpt, category, body_html, word_count,
       status, sources_json, image_url, image_credit, image_source_url,
       model, prompt_version, context_hash, generated_at, published_at,
       locked_by_admin, updated_at
     ) VALUES (
       ?, ?, ?, ?, ?, ?, ?, ?,
       ?, ?, ?, ?, ?,
       ?, ?, ?, ?, ?,
       ?, ?
     )
     ON CONFLICT(place_slug, slug) DO UPDATE SET
       title = excluded.title,
       excerpt = excluded.excerpt,
       category = excluded.category,
       body_html = excluded.body_html,
       word_count = excluded.word_count,
       status = excluded.status,
       sources_json = excluded.sources_json,
       image_url = excluded.image_url,
       image_credit = excluded.image_credit,
       image_source_url = excluded.image_source_url,
       model = excluded.model,
       prompt_version = excluded.prompt_version,
       context_hash = excluded.context_hash,
       generated_at = excluded.generated_at,
       published_at = excluded.published_at,
       locked_by_admin = excluded.locked_by_admin,
       updated_at = excluded.updated_at
     WHERE place_articles.locked_by_admin = 0`,
  ).run(
    id,
    input.placeSlug,
    input.slug,
    input.title,
    input.excerpt,
    input.category,
    input.bodyHtml,
    input.wordCount,
    input.status,
    JSON.stringify(input.sources ?? []),
    input.imageUrl ?? null,
    input.imageCredit ?? null,
    input.imageSourceUrl ?? null,
    input.model ?? null,
    input.promptVersion ?? null,
    input.contextHash ?? null,
    now,
    publishedAt,
    input.lockedByAdmin ? 1 : 0,
    now,
  );

  return getPlaceArticle(input.placeSlug, input.slug);
}

/**
 * @param {string} placeSlug
 * @param {string} slug
 * @param {{ status?: string, lockedByAdmin?: boolean, title?: string, excerpt?: string, bodyHtml?: string }} patch
 */
export function updatePlaceArticleAdmin(placeSlug, slug, patch) {
  const existing = getPlaceArticle(placeSlug, slug);
  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();
  const status = patch.status ?? existing.status;
  const publishedAt =
    status === PLACE_ARTICLE_STATUS.published
      ? (existing.publishedAt ?? now)
      : existing.publishedAt;

  getDb()
    .prepare(
      `UPDATE place_articles SET
         title = ?,
         excerpt = ?,
         body_html = ?,
         status = ?,
         published_at = ?,
         locked_by_admin = ?,
         updated_at = ?
       WHERE place_slug = ? AND slug = ?`,
    )
    .run(
      patch.title ?? existing.title,
      patch.excerpt ?? existing.excerpt,
      patch.bodyHtml ?? existing.bodyHtml,
      status,
      publishedAt,
      patch.lockedByAdmin === undefined
        ? (existing.lockedByAdmin ? 1 : 0)
        : (patch.lockedByAdmin ? 1 : 0),
      now,
      placeSlug,
      slug,
    );

  return getPlaceArticle(placeSlug, slug);
}

/**
 * @param {string} placeSlug
 */
export function hasPublishedPlaceGuide(placeSlug) {
  const row = getDb()
    .prepare(
      `SELECT 1 AS ok FROM place_articles
       WHERE place_slug = ? AND status = ?
       LIMIT 1`,
    )
    .get(placeSlug, PLACE_ARTICLE_STATUS.published);

  return Boolean(row);
}

/**
 * @param {string} placeSlug
 */
export function getLatestPlaceArticle(placeSlug) {
  const row = getDb()
    .prepare(
      `SELECT * FROM place_articles
       WHERE place_slug = ?
       ORDER BY generated_at DESC
       LIMIT 1`,
    )
    .get(placeSlug);

  return mapArticleRow(row);
}
