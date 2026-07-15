import { buildHeroCacheKey } from '@/lib/hero-image/build-hero-cache-key';
import { getCachedHeroImage, setCachedHeroImage } from '@/lib/hero-image/hero-image-cache-repo';
import { withHeroWeatherScene } from '@/lib/hero-image/hero-weather-scene';
import { resolveHeroImage } from '@/lib/hero-image/resolve-hero-image';
import { resolveStaticHeroFallback } from '@/constants/hero-fallbacks';

/**
 * @param {{
 *   city?: string | null,
 *   country?: string | null,
 *   state?: string | null,
 *   lat?: number | null,
 *   lon?: number | null,
 *   weatherScene?: string | null,
 *   temperature?: number | null,
 *   weatherId?: number | null,
 *   condition?: string | null,
 *   description?: string | null,
 *   icon?: string | null,
 * }} region
 * @param {{
 *   fetchImpl?: typeof fetch,
 *   accessKey?: string,
 *   pexelsAccessKey?: string,
 *   staticResolver?: typeof resolveStaticHeroFallback,
 *   force?: boolean,
 *   excludeLandscapeUrl?: string | null,
 *   excludePortraitUrl?: string | null,
 *   resolveHero?: typeof resolveHeroImage,
 * }} [deps]
 */
export async function getHeroImageForRegion(region, deps = {}) {
  if (!region?.country) {
    return null;
  }

  const resolvedRegion = withHeroWeatherScene(region, {
    temperature: region.temperature,
    weatherId: region.weatherId,
    condition: region.condition,
    description: region.description,
    icon: region.icon,
  });

  const cacheKey = buildHeroCacheKey(resolvedRegion);

  if (!cacheKey) {
    return null;
  }

  const cached = getCachedHeroImage(cacheKey);

  if (!deps.force && cached) {
    return cached;
  }

  const resolveHero = deps.resolveHero ?? resolveHeroImage;
  const image = await resolveHero(resolvedRegion, deps);

  if (image) {
    setCachedHeroImage(cacheKey, image);

    return {
      cacheKey,
      ...image,
    };
  }

  if (cached) {
    return cached;
  }

  const staticResolver = deps.staticResolver ?? resolveStaticHeroFallback;
  const fallback = staticResolver(resolvedRegion);

  if (!fallback) {
    return null;
  }

  return {
    cacheKey,
    ...fallback,
  };
}
