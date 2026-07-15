import {
  HERO_IMAGE_SEARCH_PER_PAGE,
  HERO_LANDSCAPE_DELIVERY,
  HERO_PORTRAIT_DELIVERY,
} from '@/constants/hero-image';
import { HERO_SOURCE } from '@/constants/hero-sources';
import { getCountryLabel } from '@/lib/geo/country-labels';
import {
  buildHeroSearchQueries,
  passesHeroAspectGate,
  passesHeroRelevanceGate,
  scoreHeroPhotoRelevance,
} from '@/lib/hero-image/unsplash-resolver';

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const GEO_RADIUS_M = 12000;

/**
 * @param {string | null | undefined} html
 */
export function stripWikiHtml(html) {
  if (!html || typeof html !== 'string') {
    return null;
  }

  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim() || null;
}

/**
 * Adapt a MediaWiki imageinfo page into the shared scorability shape.
 *
 * @param {{
 *   title?: string,
 *   imageinfo?: Array<{
 *     url?: string,
 *     thumburl?: string,
 *     width?: number,
 *     height?: number,
 *     descriptionurl?: string,
 *     extmetadata?: Record<string, { value?: string }>,
 *   }>,
 *   coordinates?: Array<{ lat?: number, lon?: number }>,
 * }} page
 */
export function adaptWikimediaPageToPhoto(page) {
  const info = page?.imageinfo?.[0];
  if (!info?.url && !info?.thumburl) {
    return null;
  }

  const meta = info.extmetadata ?? {};
  const artist = stripWikiHtml(meta.Artist?.value ?? meta.Credit?.value ?? null);
  const title = page?.title?.replace(/^File:/, '') ?? '';
  const description = stripWikiHtml(meta.ImageDescription?.value ?? null) ?? title;
  const coord = Array.isArray(page?.coordinates) ? page.coordinates[0] : null;

  return {
    id: page?.pageid ?? title,
    width: Number(info.width) || 0,
    height: Number(info.height) || 0,
    description,
    alt_description: description,
    slug: title,
    location: {
      name: title,
      city: null,
      state: null,
      country: stripWikiHtml(meta.ObjectName?.value ?? null),
      position:
        coord?.lat != null && coord?.lon != null
          ? { latitude: Number(coord.lat), longitude: Number(coord.lon) }
          : null,
    },
    urls: {
      raw: info.url ?? info.thumburl,
      regular: info.thumburl ?? info.url,
    },
    user: {
      name: artist ?? 'Wikimedia Commons',
      links: { html: info.descriptionurl ?? null },
    },
    links: {
      html: info.descriptionurl ?? null,
    },
    tags: [],
  };
}

/**
 * @param {object} photo
 * @param {string} queryUsed
 * @param {'landscape' | 'portrait'} orientation
 */
function mapWikiPhoto(photo, queryUsed, orientation) {
  if (!photo) {
    return null;
  }

  const raw = photo.urls?.raw ?? photo.urls?.regular ?? null;
  if (!raw) {
    return null;
  }

  const delivery = orientation === 'portrait' ? HERO_PORTRAIT_DELIVERY : HERO_LANDSCAPE_DELIVERY;
  // Wikimedia URLs are not Imgix — pick a sized thumb when available, else original.
  const imageUrl =
    orientation === 'landscape' && Number(delivery.w)
      ? raw
      : raw;

  return {
    imageUrl,
    blurHash: null,
    photographer: photo.user?.name ?? 'Wikimedia Commons',
    photographerUrl: photo.user?.links?.html ?? photo.links?.html ?? null,
    sourceUrl: photo.links?.html ?? null,
    sourceName: HERO_SOURCE.WIKIMEDIA,
    unsplashUrl: photo.links?.html ?? null,
    queryUsed,
  };
}

/**
 * @param {URLSearchParams} params
 * @param {typeof fetch} fetchImpl
 * @param {string} endpoint
 */
async function wikiQuery(params, fetchImpl, endpoint) {
  params.set('format', 'json');
  params.set('origin', '*');

  const userAgent =
    'MeridianWeather/1.0 (https://meridianweather.co.uk; hero-image-cascade; contact local-dev)';

  const response = await fetchImpl(`${endpoint}?${params.toString()}`, {
    signal: AbortSignal.timeout(6000),
    headers: {
      // Wikimedia rate-limits unidentified traffic; both headers are intentional.
      'User-Agent': userAgent,
      'Api-User-Agent': userAgent,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    // Rate-limit responses are often plain text; don't throw on JSON.parse.
    return null;
  }

  return response.json();
}

/**
 * @param {unknown[]} pages
 * @param {'landscape' | 'portrait'} orientation
 * @param {{ match: string, place: object, excludeImageUrls?: string[] }} options
 */
function pickWikiPhoto(pages, orientation, options) {
  const photos = (pages ?? [])
    .map((page) => adaptWikimediaPageToPhoto(page))
    .filter(Boolean)
    .filter((photo) => passesHeroAspectGate(photo.width, photo.height, orientation)
      || (photo.width > 0 && photo.height > 0 && orientation === 'landscape' && photo.width >= photo.height)
      || (photo.width > 0 && photo.height > 0 && orientation === 'portrait' && photo.height >= photo.width));

  const exclude = new Set(options.excludeImageUrls?.filter(Boolean) ?? []);

  const scored = photos
    .filter((photo) => {
      const url = photo.urls?.raw;
      return !(url && exclude.has(url));
    })
    .map((photo) => {
      const relevance = scoreHeroPhotoRelevance(photo, options.place);
      // Geosearch already constrains location — treat empty country metadata gently.
      const relaxed = {
        ...relevance,
        countryHit: relevance.countryHit || options.match === 'geo',
      };
      return { photo, relevance: relaxed };
    })
    .filter(({ relevance }) => {
      if (options.match === 'geo') {
        return !relevance.countryConflict
          && !relevance.geoTooFar
          && !relevance.weatherConflict
          && !relevance.subjectConflict;
      }
      return passesHeroRelevanceGate(relevance, options.match === 'geo' ? 'place' : options.match, options.place);
    })
    .sort((a, b) => b.relevance.score - a.relevance.score);

  return scored[0]?.photo ?? null;
}

/**
 * Lead images for Wikipedia pages near the coordinates.
 *
 * @param {{ lat: number, lon: number }} coords
 * @param {'landscape' | 'portrait'} orientation
 * @param {object} deps
 */
async function searchWikiGeosearch(coords, orientation, deps) {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const params = new URLSearchParams({
    action: 'query',
    generator: 'geosearch',
    ggscoord: `${coords.lat}|${coords.lon}`,
    ggsradius: String(GEO_RADIUS_M),
    ggslimit: String(HERO_IMAGE_SEARCH_PER_PAGE),
    prop: 'pageimages|coordinates|info',
    inprop: 'url',
    piprop: 'original',
    pilicense: 'any',
  });

  try {
    const payload = await wikiQuery(params, fetchImpl, WIKI_API);
    const pages = Object.values(payload?.query?.pages ?? {});
    // Map pageimages.original into imageinfo-like shape for the adapter.
    const normalized = pages
      .filter((page) => page?.original?.source)
      .map((page) => ({
        pageid: page.pageid,
        title: page.title,
        coordinates: page.coordinates,
        imageinfo: [{
          url: page.original.source,
          width: page.original.width,
          height: page.original.height,
          descriptionurl: page.fullurl ?? `https://en.wikipedia.org/?curid=${page.pageid}`,
          extmetadata: {
            Artist: { value: page.title },
            ImageDescription: { value: page.title },
          },
        }],
      }));

    const photo = pickWikiPhoto(normalized, orientation, {
      match: 'geo',
      place: deps.place,
      excludeImageUrls: deps.excludeImageUrls,
    });

    return mapWikiPhoto(photo, `geosearch:${coords.lat},${coords.lon}`, orientation);
  } catch {
    return null;
  }
}

/**
 * @param {string} query
 * @param {'landscape' | 'portrait'} orientation
 * @param {object} deps
 */
async function searchCommonsFiles(query, orientation, deps) {
  const fetchImpl = deps.fetchImpl ?? fetch;
  // Bitmap only — drawings are usually maps, crests, and diagrams.
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${query}`.trim(),
    gsrnamespace: '6',
    gsrlimit: String(HERO_IMAGE_SEARCH_PER_PAGE),
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata|mime',
    iiurlwidth: orientation === 'portrait' ? '1080' : '2400',
  });

  try {
    const payload = await wikiQuery(params, fetchImpl, COMMONS_API);
    const pages = Object.values(payload?.query?.pages ?? {})
      .filter((page) => {
        const mime = page?.imageinfo?.[0]?.mime ?? '';
        return !mime.includes('svg');
      });
    const photo = pickWikiPhoto(pages, orientation, {
      match: deps.match ?? 'place',
      place: deps.place,
      excludeImageUrls: deps.excludeImageUrls,
    });

    return mapWikiPhoto(photo, query, orientation);
  } catch {
    return null;
  }
}

/**
 * Prefer scenic city views before generic “city + country” hits (buses, vehicles).
 *
 * @param {{ city?: string | null, country?: string | null }} region
 * @param {{ query: string, match: string }[]} baseQueries
 */
function buildWikimediaSearchPlan(region, baseQueries) {
  const city = region?.city?.trim();
  const countryName = getCountryLabel(region?.country);
  /** @type {{ query: string, match: string }[]} */
  const scenic = [];

  if (city && countryName) {
    scenic.push({
      query: `${city} ${countryName} (skyline OR panorama OR cityscape OR "old town" OR "evening view")`,
      match: 'place',
    });
    scenic.push({
      query: `${city} ${countryName} (aerial OR waterfront OR riverside OR "market square" OR rynek)`,
      match: 'place',
    });
  }

  const placeQueries = baseQueries.filter((entry) => entry.match === 'place' || entry.match === 'region');
  return [...scenic, ...placeQueries];
}

/**
 * @param {{ query: string, match: string }[]} queries
 * @param {'landscape' | 'portrait'} orientation
 * @param {object} deps
 * @param {{ lat: number, lon: number } | null} coords
 */
async function resolveOrientation(queries, orientation, deps, coords) {
  for (const entry of queries) {
    if (entry.match === 'none') {
      continue;
    }

    const image = await searchCommonsFiles(entry.query, orientation, {
      ...deps,
      match: entry.match,
    });

    if (image) {
      return image;
    }
  }

  // Article pageimages are a last resort — lead images are often vehicles or logos.
  if (coords) {
    return searchWikiGeosearch(coords, orientation, deps);
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
 *   excludeLandscapeUrl?: string | null,
 *   excludePortraitUrl?: string | null,
 * }} [deps]
 */
export async function resolveWikimediaHeroImage(region, deps = {}) {
  const queries = buildWikimediaSearchPlan(region, buildHeroSearchQueries(region));
  if (queries.length === 0 && (region?.lat == null || region?.lon == null)) {
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
  const coords = Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;

  const landscapeDeps = {
    ...deps,
    place,
    excludeImageUrls: deps.excludeLandscapeUrl ? [deps.excludeLandscapeUrl] : undefined,
  };
  const portraitDeps = {
    ...deps,
    place,
    excludeImageUrls: deps.excludePortraitUrl ? [deps.excludePortraitUrl] : undefined,
  };

  const [landscape, portrait] = await Promise.all([
    resolveOrientation(queries, 'landscape', landscapeDeps, coords),
    resolveOrientation(queries, 'portrait', portraitDeps, coords),
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
    sourceName: HERO_SOURCE.WIKIMEDIA,
    unsplashUrl: primary?.sourceUrl ?? null,
  };
}
