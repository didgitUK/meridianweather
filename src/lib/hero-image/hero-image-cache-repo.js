import { HERO_IMAGE_CACHE_DUAL_VERSION, HERO_IMAGE_CACHE_TTL_MS } from '@/constants/hero-image';
import { inferHeroSourceName } from '@/lib/hero-image/infer-hero-source';
import { getDb } from '@/lib/db';

/**
 * @param {string | null} imageUrl
 * @param {string | null} sourceUrl
 * @param {string | null} photographer
 * @param {string | null} photographerUrl
 * @param {string | null} queryUsed
 * @param {string | null} blurHash
 * @param {string | null} [sourceNameHint]
 */
function buildCachedVariant(
  imageUrl,
  sourceUrl,
  photographer,
  photographerUrl,
  queryUsed,
  blurHash,
  sourceNameHint = null,
) {
  if (!imageUrl) {
    return null;
  }

  const sourceName = sourceNameHint ?? inferHeroSourceName(sourceUrl, imageUrl);

  return {
    imageUrl,
    blurHash,
    photographer,
    photographerUrl,
    sourceUrl,
    sourceName,
    unsplashUrl: sourceUrl,
    queryUsed,
  };
}

/**
 * @param {string} cacheKey
 */
export function getCachedHeroImage(cacheKey) {
  const row = getDb()
    .prepare(
      `SELECT cache_key,
              image_url, blur_hash, photographer, photographer_url, unsplash_url, query_used,
              portrait_image_url, portrait_blur_hash, portrait_photographer,
              portrait_photographer_url, portrait_unsplash_url, portrait_query_used,
              dual_resolved, expires_at
       FROM hero_image_cache
       WHERE cache_key = ? AND expires_at > ? AND dual_resolved = ?
       LIMIT 1`,
    )
    .get(cacheKey, new Date().toISOString(), HERO_IMAGE_CACHE_DUAL_VERSION);

  if (!row) {
    return null;
  }

  const landscape = buildCachedVariant(
    row.image_url,
    row.unsplash_url,
    row.photographer,
    row.photographer_url,
    row.query_used,
    row.blur_hash,
  );

  const portrait = buildCachedVariant(
    row.portrait_image_url,
    row.portrait_unsplash_url,
    row.portrait_photographer,
    row.portrait_photographer_url,
    row.portrait_query_used,
    row.portrait_blur_hash,
  );

  if (!landscape && !portrait) {
    return null;
  }

  const primary = landscape ?? portrait;

  return {
    cacheKey: row.cache_key,
    landscape,
    portrait,
    photographer: primary?.photographer ?? null,
    photographerUrl: primary?.photographerUrl ?? null,
    sourceUrl: primary?.sourceUrl ?? null,
    sourceName: primary?.sourceName ?? null,
    unsplashUrl: primary?.unsplashUrl ?? null,
  };
}

/**
 * @param {string} cacheKey
 * @param {{
 *   landscape?: {
 *     imageUrl: string;
 *     blurHash?: string | null;
 *     photographer?: string | null;
 *     photographerUrl?: string | null;
 *     unsplashUrl?: string | null;
 *     sourceUrl?: string | null;
 *     queryUsed?: string | null;
 *   } | null;
 *   portrait?: {
 *     imageUrl: string;
 *     blurHash?: string | null;
 *     photographer?: string | null;
 *     photographerUrl?: string | null;
 *     unsplashUrl?: string | null;
 *     sourceUrl?: string | null;
 *     queryUsed?: string | null;
 *   } | null;
 * }} image
 */
export function setCachedHeroImage(cacheKey, image) {
  const fetchedAt = new Date();
  const expiresAt = new Date(fetchedAt.getTime() + HERO_IMAGE_CACHE_TTL_MS);
  const landscape = image.landscape ?? null;
  const portrait = image.portrait ?? null;

  getDb()
    .prepare(
      `INSERT INTO hero_image_cache (
         cache_key,
         image_url, blur_hash, photographer, photographer_url, unsplash_url, query_used,
         portrait_image_url, portrait_blur_hash, portrait_photographer,
         portrait_photographer_url, portrait_unsplash_url, portrait_query_used,
         dual_resolved, fetched_at, expires_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(cache_key) DO UPDATE SET
         image_url = excluded.image_url,
         blur_hash = excluded.blur_hash,
         photographer = excluded.photographer,
         photographer_url = excluded.photographer_url,
         unsplash_url = excluded.unsplash_url,
         query_used = excluded.query_used,
         portrait_image_url = excluded.portrait_image_url,
         portrait_blur_hash = excluded.portrait_blur_hash,
         portrait_photographer = excluded.portrait_photographer,
         portrait_photographer_url = excluded.portrait_photographer_url,
         portrait_unsplash_url = excluded.portrait_unsplash_url,
         portrait_query_used = excluded.portrait_query_used,
         dual_resolved = excluded.dual_resolved,
         fetched_at = excluded.fetched_at,
         expires_at = excluded.expires_at`,
    )
    .run(
      cacheKey,
      landscape?.imageUrl ?? null,
      landscape?.blurHash ?? null,
      landscape?.photographer ?? null,
      landscape?.photographerUrl ?? null,
      landscape?.sourceUrl ?? landscape?.unsplashUrl ?? null,
      landscape?.queryUsed ?? null,
      portrait?.imageUrl ?? null,
      portrait?.blurHash ?? null,
      portrait?.photographer ?? null,
      portrait?.photographerUrl ?? null,
      portrait?.sourceUrl ?? portrait?.unsplashUrl ?? null,
      portrait?.queryUsed ?? null,
      HERO_IMAGE_CACHE_DUAL_VERSION,
      fetchedAt.toISOString(),
      expiresAt.toISOString(),
    );
}
