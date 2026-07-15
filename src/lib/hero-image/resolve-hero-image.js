import { HERO_SOURCE } from '@/constants/hero-sources';
import { normalizeHeroImage } from '@/lib/hero-image/normalize-hero-variant';
import { resolvePexelsHeroImage } from '@/lib/hero-image/pexels-resolver';
import { resolveUnsplashHeroImage } from '@/lib/hero-image/unsplash-resolver';
import { resolveWikimediaHeroImage } from '@/lib/hero-image/wikimedia-resolver';

/**
 * Cascade: Unsplash → Wikimedia Commons → Pexels.
 *
 * @param {{
 *   city?: string | null,
 *   country?: string | null,
 *   state?: string | null,
 *   lat?: number | null,
 *   lon?: number | null,
 * }} region
 * @param {{
 *   fetchImpl?: typeof fetch,
 *   accessKey?: string,
 *   pexelsAccessKey?: string,
 *   excludeLandscapeUrl?: string | null,
 *   excludePortraitUrl?: string | null,
 *   unsplashResolver?: typeof resolveUnsplashHeroImage,
 *   wikimediaResolver?: typeof resolveWikimediaHeroImage,
 *   pexelsResolver?: typeof resolvePexelsHeroImage,
 * }} [deps]
 */
export async function resolveHeroImage(region, deps = {}) {
  const unsplashResolver = deps.unsplashResolver ?? resolveUnsplashHeroImage;
  const wikimediaResolver = deps.wikimediaResolver ?? resolveWikimediaHeroImage;
  const pexelsResolver = deps.pexelsResolver ?? resolvePexelsHeroImage;

  const unsplash = await unsplashResolver(region, {
    fetchImpl: deps.fetchImpl,
    accessKey: deps.accessKey,
    excludeLandscapeUrl: deps.excludeLandscapeUrl,
    excludePortraitUrl: deps.excludePortraitUrl,
  });
  const normalizedUnsplash = normalizeHeroImage(unsplash, HERO_SOURCE.UNSPLASH);
  if (normalizedUnsplash) {
    return normalizedUnsplash;
  }

  const wikimedia = await wikimediaResolver(region, {
    fetchImpl: deps.fetchImpl,
    excludeLandscapeUrl: deps.excludeLandscapeUrl,
    excludePortraitUrl: deps.excludePortraitUrl,
  });
  const normalizedWiki = normalizeHeroImage(wikimedia, HERO_SOURCE.WIKIMEDIA);
  if (normalizedWiki) {
    return normalizedWiki;
  }

  const pexels = await pexelsResolver(region, {
    fetchImpl: deps.fetchImpl,
    accessKey: deps.pexelsAccessKey,
    excludeLandscapeUrl: deps.excludeLandscapeUrl,
    excludePortraitUrl: deps.excludePortraitUrl,
  });
  return normalizeHeroImage(pexels, HERO_SOURCE.PEXELS);
}
