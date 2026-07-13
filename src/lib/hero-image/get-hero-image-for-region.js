import { buildHeroCacheKey } from '@/lib/hero-image/build-hero-cache-key';
import { getCachedHeroImage, setCachedHeroImage } from '@/lib/hero-image/hero-image-cache-repo';
import { resolveUnsplashHeroImage } from '@/lib/hero-image/unsplash-resolver';
import { resolveStaticHeroFallback } from '@/constants/hero-fallbacks';

/**
 * @param {{ city?: string | null, country?: string | null, lat?: number | null, lon?: number | null }} region
 * @param {{ fetchImpl?: typeof fetch, accessKey?: string, staticResolver?: typeof resolveStaticHeroFallback }} [deps]
 */
export async function getHeroImageForRegion(region, deps = {}) {
  if (!region?.country) {
    return null;
  }

  const cacheKey = buildHeroCacheKey(region);

  if (!cacheKey) {
    return null;
  }

  const cached = getCachedHeroImage(cacheKey);

  if (cached) {
    return cached;
  }

  const image = await resolveUnsplashHeroImage(region, deps);

  if (image) {
    setCachedHeroImage(cacheKey, image);

    return {
      cacheKey,
      ...image,
    };
  }

  const staticResolver = deps.staticResolver ?? resolveStaticHeroFallback;
  const fallback = staticResolver(region);

  if (!fallback) {
    return null;
  }

  return {
    cacheKey,
    ...fallback,
  };
}
