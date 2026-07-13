import {
  HERO_LANDSCAPE_ASPECT_MAX,
  HERO_LANDSCAPE_ASPECT_MIN,
  HERO_LANDSCAPE_DELIVERY,
  HERO_LANDSCAPE_MIN_WIDTH,
  HERO_PORTRAIT_ASPECT_MAX,
  HERO_PORTRAIT_ASPECT_MIN,
  HERO_PORTRAIT_DELIVERY,
  HERO_PORTRAIT_MIN_HEIGHT,
  HERO_IMAGE_SEARCH_PER_PAGE,
} from '@/constants/hero-image';
import { getCountryLabel } from '@/lib/geo/country-labels';

/**
 * @param {{ city?: string | null, country?: string | null }} region
 */
export function buildHeroSearchQueries(region) {
  const countryName = getCountryLabel(region?.country);
  const city = region?.city?.trim();
  const queries = [];

  if (city && countryName) {
    queries.push(`${city} ${countryName} landmark`);
    queries.push(`${city} ${countryName} monument`);
  }

  if (city) {
    queries.push(`${city} skyline`);
    queries.push(`${city} cityscape`);
  }

  if (countryName) {
    queries.push(`${countryName} landscape`);
  }

  return queries;
}

/**
 * @param {number} width
 * @param {number} height
 * @param {'landscape' | 'portrait'} orientation
 */
export function passesHeroAspectGate(width, height, orientation) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return false;
  }

  const aspect = width / height;

  if (orientation === 'landscape') {
    return (
      width >= HERO_LANDSCAPE_MIN_WIDTH
      && aspect >= HERO_LANDSCAPE_ASPECT_MIN
      && aspect <= HERO_LANDSCAPE_ASPECT_MAX
    );
  }

  if (orientation === 'portrait') {
    return (
      height >= HERO_PORTRAIT_MIN_HEIGHT
      && aspect >= HERO_PORTRAIT_ASPECT_MIN
      && aspect <= HERO_PORTRAIT_ASPECT_MAX
    );
  }

  return false;
}

/**
 * @param {unknown[]} results
 * @param {'landscape' | 'portrait'} orientation
 */
export function pickHeroPhoto(results, orientation) {
  if (!Array.isArray(results)) {
    return null;
  }

  return results.find((photo) => {
    const width = Number(photo?.width);
    const height = Number(photo?.height);
    return passesHeroAspectGate(width, height, orientation);
  }) ?? null;
}

/**
 * @param {string} rawUrl
 * @param {Record<string, string | number>} delivery
 */
export function buildHeroDeliveryUrl(rawUrl, delivery) {
  let url;

  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  for (const [key, value] of Object.entries(delivery)) {
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

/**
 * @param {object} photo
 * @param {string} queryUsed
 * @param {'landscape' | 'portrait'} orientation
 */
function mapUnsplashPhoto(photo, queryUsed, orientation) {
  const rawUrl = photo?.urls?.raw ?? photo?.urls?.regular ?? photo?.urls?.small ?? null;

  if (!rawUrl) {
    return null;
  }

  const delivery = orientation === 'portrait' ? HERO_PORTRAIT_DELIVERY : HERO_LANDSCAPE_DELIVERY;
  const imageUrl = buildHeroDeliveryUrl(rawUrl, delivery) ?? (photo?.urls?.regular ?? photo?.urls?.small ?? null);

  if (!imageUrl) {
    return null;
  }

  return {
    imageUrl,
    blurHash: photo.blur_hash ?? null,
    photographer: photo.user?.name ?? null,
    photographerUrl: photo.user?.links?.html ?? null,
    unsplashUrl: photo.links?.html ?? null,
    queryUsed,
  };
}

/**
 * @param {string} query
 * @param {'landscape' | 'portrait'} orientation
 * @param {{ fetchImpl?: typeof fetch, accessKey?: string }} [deps]
 */
export async function searchUnsplashHeroImage(query, orientation, deps = {}) {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const accessKey = deps.accessKey ?? process.env.UNSPLASH_ACCESS_KEY?.trim();

  if (!accessKey || !query?.trim()) {
    return null;
  }

  const params = new URLSearchParams({
    query: query.trim(),
    orientation,
    content_filter: 'high',
    order_by: 'relevant',
    per_page: String(HERO_IMAGE_SEARCH_PER_PAGE),
  });

  try {
    const response = await fetchImpl(`https://api.unsplash.com/search/photos?${params.toString()}`, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const photo = pickHeroPhoto(payload?.results, orientation);

    return mapUnsplashPhoto(photo, query.trim(), orientation);
  } catch {
    return null;
  }
}

/**
 * @param {string[]} queries
 * @param {'landscape' | 'portrait'} orientation
 * @param {{ fetchImpl?: typeof fetch, accessKey?: string }} [deps]
 */
async function resolveOrientation(queries, orientation, deps) {
  for (const query of queries) {
    const image = await searchUnsplashHeroImage(query, orientation, deps);

    if (image) {
      return image;
    }
  }

  return null;
}

/**
 * @param {{ city?: string | null, country?: string | null }} region
 * @param {{ fetchImpl?: typeof fetch, accessKey?: string }} [deps]
 */
export async function resolveUnsplashHeroImage(region, deps = {}) {
  const queries = buildHeroSearchQueries(region);

  if (queries.length === 0) {
    return null;
  }

  const [landscape, portrait] = await Promise.all([
    resolveOrientation(queries, 'landscape', deps),
    resolveOrientation(queries, 'portrait', deps),
  ]);

  if (!landscape && !portrait) {
    return null;
  }

  const primary = landscape ?? portrait;

  return {
    landscape,
    portrait,
    photographer: primary?.photographer ?? null,
    photographerUrl: primary?.photographerUrl ?? null,
    unsplashUrl: primary?.unsplashUrl ?? null,
  };
}
