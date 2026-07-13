import { HERO_IMAGE_CACHE_DUAL_VERSION, HERO_IMAGE_CACHE_TTL_MS } from '@/constants/hero-image';
import { getDb } from '@/lib/db';

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

  const landscape = row.image_url
    ? {
        imageUrl: row.image_url,
        blurHash: row.blur_hash,
        photographer: row.photographer,
        photographerUrl: row.photographer_url,
        unsplashUrl: row.unsplash_url,
        queryUsed: row.query_used,
      }
    : null;

  const portrait = row.portrait_image_url
    ? {
        imageUrl: row.portrait_image_url,
        blurHash: row.portrait_blur_hash,
        photographer: row.portrait_photographer,
        photographerUrl: row.portrait_photographer_url,
        unsplashUrl: row.portrait_unsplash_url,
        queryUsed: row.portrait_query_used,
      }
    : null;

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
 *     queryUsed?: string | null;
 *   } | null;
 *   portrait?: {
 *     imageUrl: string;
 *     blurHash?: string | null;
 *     photographer?: string | null;
 *     photographerUrl?: string | null;
 *     unsplashUrl?: string | null;
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
      landscape?.unsplashUrl ?? null,
      landscape?.queryUsed ?? null,
      portrait?.imageUrl ?? null,
      portrait?.blurHash ?? null,
      portrait?.photographer ?? null,
      portrait?.photographerUrl ?? null,
      portrait?.unsplashUrl ?? null,
      portrait?.queryUsed ?? null,
      HERO_IMAGE_CACHE_DUAL_VERSION,
      fetchedAt.toISOString(),
      expiresAt.toISOString(),
    );
}
