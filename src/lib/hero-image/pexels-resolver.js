import { HERO_IMAGE_SEARCH_PER_PAGE } from '@/constants/hero-image';
import { HERO_SOURCE } from '@/constants/hero-sources';
import { getCountryLabel } from '@/lib/geo/country-labels';
import {
  buildHeroSearchQueries,
  pickHeroPhoto,
} from '@/lib/hero-image/unsplash-resolver';

/**
 * @param {object} photo Pexels photo JSON
 */
export function adaptPexelsPhoto(photo) {
  if (!photo?.src?.original && !photo?.src?.large2x) {
    return null;
  }

  return {
    id: photo.id,
    width: Number(photo.width) || 0,
    height: Number(photo.height) || 0,
    description: photo.alt ?? '',
    alt_description: photo.alt ?? '',
    slug: String(photo.id),
    location: {
      name: null,
      city: null,
      state: null,
      country: null,
      position: null,
    },
    urls: {
      raw: photo.src.original ?? photo.src.large2x,
      regular: photo.src.large2x ?? photo.src.large ?? photo.src.original,
    },
    user: {
      name: photo.photographer ?? 'Pexels',
      links: { html: photo.photographer_url ?? null },
    },
    links: {
      html: photo.url ?? null,
    },
    tags: [],
  };
}

/**
 * @param {object} photo Adapted photo
 * @param {string} queryUsed
 * @param {'landscape' | 'portrait'} orientation
 */
function mapPexelsPhoto(photo, queryUsed, orientation) {
  if (!photo) {
    return null;
  }

  const imageUrl =
    orientation === 'portrait'
      ? (photo.urls?.regular ?? photo.urls?.raw)
      : (photo.urls?.raw ?? photo.urls?.regular);

  if (!imageUrl) {
    return null;
  }

  return {
    imageUrl,
    blurHash: null,
    photographer: photo.user?.name ?? 'Pexels',
    photographerUrl: photo.user?.links?.html ?? null,
    sourceUrl: photo.links?.html ?? null,
    sourceName: HERO_SOURCE.PEXELS,
    unsplashUrl: photo.links?.html ?? null,
    queryUsed,
  };
}

/**
 * @param {string} query
 * @param {'landscape' | 'portrait'} orientation
 * @param {object} deps
 */
export async function searchPexelsHeroImage(query, orientation, deps = {}) {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const accessKey = deps.accessKey ?? process.env.PEXELS_API_KEY?.trim();

  if (!accessKey || !query?.trim()) {
    return null;
  }

  const params = new URLSearchParams({
    query: query.trim(),
    orientation,
    per_page: String(HERO_IMAGE_SEARCH_PER_PAGE),
  });

  try {
    const response = await fetchImpl(`https://api.pexels.com/v1/search?${params.toString()}`, {
      headers: {
        Authorization: accessKey,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const adapted = (payload?.photos ?? []).map(adaptPexelsPhoto).filter(Boolean);
    const photo = pickHeroPhoto(adapted, orientation, {
      random: true,
      excludeImageUrls: deps.excludeImageUrls,
      match: deps.match ?? 'none',
      place: deps.place,
    });

    return mapPexelsPhoto(photo, query.trim(), orientation);
  } catch {
    return null;
  }
}

/**
 * @param {{ query: string, match: string }[]} queries
 * @param {'landscape' | 'portrait'} orientation
 * @param {object} deps
 */
async function resolveOrientation(queries, orientation, deps) {
  for (const entry of queries) {
    const image = await searchPexelsHeroImage(entry.query, orientation, {
      ...deps,
      match: entry.match,
    });

    if (image) {
      return image;
    }
  }

  return null;
}

/**
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
 *   excludeLandscapeUrl?: string | null,
 *   excludePortraitUrl?: string | null,
 * }} [deps]
 */
export async function resolvePexelsHeroImage(region, deps = {}) {
  const accessKey = deps.accessKey ?? process.env.PEXELS_API_KEY?.trim();
  if (!accessKey) {
    return null;
  }

  const queries = buildHeroSearchQueries(region);
  if (queries.length === 0) {
    return null;
  }

  const countryName = getCountryLabel(region?.country);
  const lat = Number(region?.lat);
  const lon = Number(region?.lon);
  const place = {
    city: region?.city ?? null,
    state: region?.state ?? null,
    countryName,
    countryCode: region?.country ?? null,
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
    weatherScene: region?.weatherScene ?? null,
  };

  const landscapeDeps = {
    ...deps,
    accessKey,
    place,
    excludeImageUrls: deps.excludeLandscapeUrl ? [deps.excludeLandscapeUrl] : undefined,
  };
  const portraitDeps = {
    ...deps,
    accessKey,
    place,
    excludeImageUrls: deps.excludePortraitUrl ? [deps.excludePortraitUrl] : undefined,
  };

  const [landscape, portrait] = await Promise.all([
    resolveOrientation(queries, 'landscape', landscapeDeps),
    resolveOrientation(queries, 'portrait', portraitDeps),
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
    sourceUrl: primary?.sourceUrl ?? null,
    sourceName: HERO_SOURCE.PEXELS,
    unsplashUrl: primary?.sourceUrl ?? null,
  };
}
