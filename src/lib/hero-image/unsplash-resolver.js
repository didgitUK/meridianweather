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
import { HERO_SOURCE } from '@/constants/hero-sources';
import { getCountryLabel } from '@/lib/geo/country-labels';
import {
  getHeroSceneQueryCues,
  photoConflictsWeatherScene,
  scoreWeatherSceneBonus,
} from '@/lib/hero-image/hero-weather-scene';
import {
  photoConflictsHeroSubject,
  scoreHeroSubjectBonus,
} from '@/lib/hero-image/hero-subject-quality';

/** Honorific/article tokens that alone do not prove a location match. */
const PLACE_TOKEN_STOPWORDS = new Set([
  'st',
  'saint',
  'san',
  'santa',
  'ste',
  'the',
  'of',
  'and',
  'de',
  'la',
  'le',
  'el',
  'los',
  'las',
]);

/** Common Unsplash location.country labels → ISO-ish codes for conflict checks. */
const PHOTO_COUNTRY_ALIASES = Object.freeze({
  GB: ['united kingdom', 'uk', 'great britain', 'britain', 'england', 'scotland', 'wales', 'northern ireland'],
  US: ['united states', 'usa', 'united states of america', 'america'],
  CA: ['canada'],
  AU: ['australia'],
  NZ: ['new zealand'],
  IE: ['ireland', 'republic of ireland'],
  FR: ['france'],
  DE: ['germany', 'deutschland'],
  ES: ['spain', 'españa', 'espana'],
  IT: ['italy', 'italia'],
  JP: ['japan'],
  IN: ['india'],
});

/** Reject geotagged photos farther than this from the city (twin-town guard). */
const HERO_PLACE_MAX_DISTANCE_KM = 400;

/**
 * @param {string | null | undefined} value
 * @returns {string[]}
 */
export function tokenizePlaceName(value) {
  if (!value || typeof value !== 'string') {
    return [];
  }

  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !PLACE_TOKEN_STOPWORDS.has(token));
}

/**
 * @param {string} haystack
 * @param {string[]} tokens
 */
function haystackHasAllTokens(haystack, tokens) {
  return tokens.length > 0 && tokens.every((token) => haystack.includes(token));
}

/**
 * @param {string} haystack
 * @param {string | null | undefined} phrase
 */
function haystackHasPhrase(haystack, phrase) {
  const normalized = phrase?.trim().toLowerCase();
  return Boolean(normalized) && haystack.includes(normalized);
}

/**
 * @param {string | null | undefined} value
 */
function normalizePlaceLabel(value) {
  return value
    ?.trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    ?? '';
}

/**
 * @param {string | null | undefined} photoCountry
 * @param {string | null | undefined} placeCountryCode
 */
export function photoCountryConflicts(photoCountry, placeCountryCode) {
  const photoNorm = normalizePlaceLabel(photoCountry);
  const code = placeCountryCode?.trim().toUpperCase() ?? '';

  if (!photoNorm || !code) {
    return false;
  }

  const ownAliases = PHOTO_COUNTRY_ALIASES[code] ?? [];
  if (
    ownAliases.some((alias) => photoNorm === alias || photoNorm.includes(alias))
    || photoNorm === code.toLowerCase()
  ) {
    return false;
  }

  for (const [otherCode, aliases] of Object.entries(PHOTO_COUNTRY_ALIASES)) {
    if (otherCode === code) {
      continue;
    }
    if (aliases.some((alias) => photoNorm === alias || photoNorm.includes(alias))) {
      return true;
    }
  }

  return false;
}

/**
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * @param {string | null | undefined} countryCode
 * @param {string | null | undefined} state
 */
function ukNationHint(countryCode, state) {
  if (countryCode?.toUpperCase() !== 'GB') {
    return null;
  }

  const stateNorm = normalizePlaceLabel(state);
  if (stateNorm.includes('scotland')) return 'Scotland';
  if (stateNorm.includes('wales')) return 'Wales';
  if (stateNorm.includes('northern ireland') || stateNorm === 'nir') return 'Northern Ireland';
  return 'England';
}

/**
 * @param {unknown} photo
 */
function buildPhotoHaystack(photo) {
  const tags = Array.isArray(photo?.tags)
    ? photo.tags.map((tag) => (typeof tag === 'string' ? tag : tag?.title)).filter(Boolean)
    : [];

  return [
    photo?.description,
    photo?.alt_description,
    photo?.slug,
    photo?.location?.name,
    photo?.location?.city,
    photo?.location?.state,
    photo?.location?.country,
    ...tags,
  ]
    .filter((part) => typeof part === 'string' && part.trim())
    .join(' ')
    .toLowerCase();
}

/**
 * @param {unknown} photo
 * @param {{
 *   city?: string | null,
 *   state?: string | null,
 *   countryName?: string | null,
 *   countryCode?: string | null,
 *   lat?: number | null,
 *   lon?: number | null,
 * }} place
 * @returns {{
 *   score: number,
 *   cityHit: boolean,
 *   stateHit: boolean,
 *   countryHit: boolean,
 *   countryConflict: boolean,
 *   geoTooFar: boolean,
 * }}
 */
export function scoreHeroPhotoRelevance(photo, place) {
  const haystack = buildPhotoHaystack(photo);
  const cityTokens = tokenizePlaceName(place.city);
  const stateTokens = tokenizePlaceName(place.state);
  const countryTokens = tokenizePlaceName(place.countryName);
  const countryCode = place.countryCode?.trim().toUpperCase() ?? '';
  const countryAliases = PHOTO_COUNTRY_ALIASES[countryCode] ?? [];

  const locCity = normalizePlaceLabel(photo?.location?.city);
  const locState = normalizePlaceLabel(photo?.location?.state);
  const locCountry = normalizePlaceLabel(photo?.location?.country);
  const countryName = normalizePlaceLabel(place.countryName);
  const placeCity = normalizePlaceLabel(place.city);
  const placeState = normalizePlaceLabel(place.state);

  const countryConflict = photoCountryConflicts(locCountry || null, countryCode);

  const cityHit = Boolean(
    (cityTokens.length > 0 && haystackHasAllTokens(haystack, cityTokens))
    || haystackHasPhrase(haystack, place.city)
    || (locCity && placeCity && locCity === placeCity),
  );

  const stateHit = Boolean(
    (stateTokens.length > 0 && haystackHasAllTokens(haystack, stateTokens))
    || haystackHasPhrase(haystack, place.state)
    || (locState && placeState && locState === placeState),
  );

  const countryAliasHit = countryAliases.some((alias) => {
    if (locCountry && (locCountry === alias || locCountry.includes(alias))) {
      return true;
    }
    // Skip 2-letter aliases in free text ("uk" matches too many substrings).
    if (alias.length <= 2) {
      return false;
    }
    return haystack.includes(alias);
  });

  const countryHit = Boolean(
    !countryConflict
    && (
      (countryTokens.length > 0 && haystackHasAllTokens(haystack, countryTokens))
      || haystackHasPhrase(haystack, place.countryName)
      || (locCountry && countryName && locCountry === countryName)
      || (locCountry && countryCode && locCountry === countryCode.toLowerCase())
      || countryAliasHit
    ),
  );

  const placeLat = Number(place.lat);
  const placeLon = Number(place.lon);
  const photoLat = Number(photo?.location?.position?.latitude);
  const photoLon = Number(photo?.location?.position?.longitude);
  const hasPlaceGeo = Number.isFinite(placeLat) && Number.isFinite(placeLon);
  const hasPhotoGeo = Number.isFinite(photoLat) && Number.isFinite(photoLon);

  let geoTooFar = false;
  let geoBonus = 0;

  if (hasPlaceGeo && hasPhotoGeo) {
    const distanceKm = haversineDistanceKm(placeLat, placeLon, photoLat, photoLon);
    if (distanceKm > HERO_PLACE_MAX_DISTANCE_KM) {
      geoTooFar = true;
    } else if (distanceKm <= 50) {
      geoBonus = 6;
    } else if (distanceKm <= 150) {
      geoBonus = 4;
    } else {
      geoBonus = 2;
    }
  }

  const weatherScene = place.weatherScene ?? null;
  const weatherConflict = photoConflictsWeatherScene(haystack, weatherScene);
  const weatherBonus = weatherConflict ? 0 : scoreWeatherSceneBonus(haystack, weatherScene);
  const subjectConflict = photoConflictsHeroSubject(haystack);
  const subjectBonus = subjectConflict ? 0 : scoreHeroSubjectBonus(haystack);

  let score = 0;
  if (cityHit) score += 4;
  if (stateHit) score += 3;
  if (countryHit) score += 2;
  score += geoBonus;
  score += weatherBonus;
  score += subjectBonus;

  return {
    score,
    cityHit,
    stateHit,
    countryHit,
    countryConflict,
    geoTooFar,
    weatherConflict,
    subjectConflict,
  };
}

/**
 * Place photos must mention the city and geographic co-evidence (state and/or country)
 * so twin names (St Kitts AU vs Caribbean / Brampton GB vs CA) do not steal heroes.
 *
 * @param {{
 *   cityHit: boolean,
 *   stateHit: boolean,
 *   countryHit: boolean,
 *   countryConflict?: boolean,
 *   geoTooFar?: boolean,
 *   weatherConflict?: boolean,
 * }} relevance
 * @param {'place' | 'region' | 'none'} match
 * @param {{ city?: string | null, state?: string | null, countryName?: string | null }} place
 */
export function passesHeroRelevanceGate(relevance, match, place) {
  if (
    relevance.countryConflict
    || relevance.geoTooFar
    || relevance.weatherConflict
    || relevance.subjectConflict
  ) {
    return false;
  }

  if (match === 'none') {
    return true;
  }

  if (match === 'region') {
    if (place.state) {
      // Require the state itself — country-only hits still surface national icons.
      return relevance.stateHit;
    }
    return relevance.countryHit;
  }

  // match === 'place'
  if (!relevance.cityHit) {
    return false;
  }

  if (place.state) {
    return relevance.stateHit || relevance.countryHit;
  }

  if (place.countryName) {
    return relevance.countryHit;
  }

  return true;
}

/**
 * Ranked Unsplash queries. Place tiers require photo metadata to mention the city
 * plus state/country; region tiers (state landscape) avoid national tourist icons;
 * country Unsplash only runs when no city was requested.
 *
 * When `weatherScene` is set, weather-cued place queries run first so hot days
 * prefer summer/sunny shots and snow days avoid beach captions.
 *
 * @param {{
 *   city?: string | null,
 *   country?: string | null,
 *   state?: string | null,
 *   weatherScene?: string | null,
 * }} region
 * @returns {{ query: string, match: 'place' | 'region' | 'none' }[]}
 */
export function buildHeroSearchQueries(region) {
  const countryName = getCountryLabel(region?.country);
  const city = region?.city?.trim();
  const state = region?.state?.trim();
  const countryCode = region?.country?.trim()?.toUpperCase() ?? '';
  const nation = ukNationHint(countryCode, state);
  const sceneCues = getHeroSceneQueryCues(region?.weatherScene);
  /** @type {{ query: string, match: 'place' | 'region' | 'none' }[]} */
  const placeQueries = [];
  /** @type {{ query: string, match: 'place' | 'region' | 'none' }[]} */
  const queries = [];

  if (city && state && countryName) {
    placeQueries.push({ query: `${city} ${state} ${countryName}`, match: 'place' });
    placeQueries.push({ query: `${city}, ${state}, ${countryName}`, match: 'place' });
    if (nation && nation !== state) {
      placeQueries.push({ query: `${city} ${state} ${nation}`, match: 'place' });
    }
    placeQueries.push({ query: `${city} ${state} landscape`, match: 'place' });
    placeQueries.push({ query: `${city} ${state}`, match: 'place' });
  } else if (city && state) {
    placeQueries.push({ query: `${city} ${state}`, match: 'place' });
    placeQueries.push({ query: `${city} ${state} landscape`, match: 'place' });
  }

  if (city && nation && countryName) {
    placeQueries.push({ query: `${city} ${nation}`, match: 'place' });
    placeQueries.push({ query: `${city} ${nation} ${countryName}`, match: 'place' });
    placeQueries.push({ query: `${city} ${nation} town`, match: 'place' });
  }

  if (city && countryName) {
    // Prefer country-first phrasing so twin towns (Brampton CA) lose to local hits.
    placeQueries.push({ query: `${countryName} ${city}`, match: 'place' });
    placeQueries.push({ query: `${city} ${countryName}`, match: 'place' });
    placeQueries.push({ query: `${city} ${countryName} town`, match: 'place' });
    placeQueries.push({ query: `${city} ${countryName} landscape`, match: 'place' });
  }

  if (sceneCues.length > 0 && placeQueries.length > 0) {
    const weatherFirst = [];
    for (const cue of sceneCues) {
      for (const entry of placeQueries.slice(0, 4)) {
        weatherFirst.push({ query: `${entry.query} ${cue}`, match: 'place' });
      }
    }
    queries.push(...weatherFirst);
  }

  queries.push(...placeQueries);

  // Prefer state/region atmospherics over national landmarks (Sydney for any AU town).
  if (state && countryName) {
    if (sceneCues[0]) {
      queries.push({ query: `${state} ${countryName} ${sceneCues[0]}`, match: 'region' });
    }
    queries.push({ query: `${state} ${countryName} landscape`, match: 'region' });
    queries.push({ query: `${state} landscape`, match: 'region' });
  } else if (nation && countryName) {
    if (sceneCues[0]) {
      queries.push({ query: `${nation} ${countryName} ${sceneCues[0]}`, match: 'region' });
    }
    queries.push({ query: `${nation} ${countryName} landscape`, match: 'region' });
  }

  if (!city && countryName) {
    if (sceneCues[0]) {
      queries.push({ query: `${countryName} ${sceneCues[0]}`, match: 'none' });
    }
    queries.push({ query: `${countryName} landscape`, match: 'none' });
    queries.push({ query: `${countryName} travel photography`, match: 'none' });
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
 * @param {unknown} photo
 * @param {Set<string> | null} excludePhotoIds
 * @param {Set<string> | null} excludeRawUrls
 */
function isExcludedHeroPhoto(photo, excludePhotoIds, excludeRawUrls) {
  const id = photo?.id != null ? String(photo.id) : null;
  if (id && excludePhotoIds?.has(id)) {
    return true;
  }

  const raw = photo?.urls?.raw ?? photo?.urls?.regular ?? null;
  if (typeof raw === 'string' && excludeRawUrls?.size) {
    for (const excluded of excludeRawUrls) {
      if (raw === excluded || raw.startsWith(excluded) || excluded.startsWith(raw.split('?')[0])) {
        return true;
      }
    }
  }

  return false;
}

/**
 * @param {unknown[]} results
 * @param {'landscape' | 'portrait'} orientation
 * @param {{
 *   random?: boolean,
 *   excludePhotoIds?: string[],
 *   excludeImageUrls?: string[],
 *   match?: 'place' | 'region' | 'none',
 *   place?: {
 *     city?: string | null,
 *     state?: string | null,
 *     countryName?: string | null,
 *     countryCode?: string | null,
 *     lat?: number | null,
 *     lon?: number | null,
 *   },
 * }} [options]
 */
export function pickHeroPhoto(results, orientation, options = {}) {
  if (!Array.isArray(results)) {
    return null;
  }

  const excludePhotoIds = options.excludePhotoIds?.length
    ? new Set(options.excludePhotoIds.map(String))
    : null;
  const excludeRawUrls = options.excludeImageUrls?.length
    ? new Set(options.excludeImageUrls.filter((url) => typeof url === 'string'))
    : null;
  const match = options.match ?? 'none';
  const place = options.place ?? {};

  const aspectCandidates = results.filter((photo) => {
    const width = Number(photo?.width);
    const height = Number(photo?.height);
    return passesHeroAspectGate(width, height, orientation);
  });

  const scored = aspectCandidates
    .filter((photo) => !isExcludedHeroPhoto(photo, excludePhotoIds, excludeRawUrls))
    .map((photo) => {
      const relevance = scoreHeroPhotoRelevance(photo, place);
      return { photo, relevance };
    })
    .filter(({ relevance }) => passesHeroRelevanceGate(relevance, match, place))
    .sort((a, b) => b.relevance.score - a.relevance.score);

  // For country-level (match: none) keep prior cycle behaviour: if every gated
  // photo was excluded, reuse the aspect pool. Never do that for place/region —
  // empty-metadata tourist shots must not win.
  let candidates = scored.map(({ photo }) => photo);

  if (candidates.length === 0 && match === 'none') {
    candidates = aspectCandidates.filter(
      (photo) => !isExcludedHeroPhoto(photo, excludePhotoIds, excludeRawUrls),
    );
    if (candidates.length === 0) {
      candidates = aspectCandidates;
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  if (options.random && candidates.length > 1) {
    const topScore = scored[0]?.relevance.score ?? 0;
    const topTied = scored.length > 0 && match !== 'none'
      ? scored.filter(({ relevance }) => relevance.score === topScore).map(({ photo }) => photo)
      : candidates;
    const pool = topTied.length > 0 ? topTied : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  return candidates[0];
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

  const sourceUrl = photo.links?.html ?? null;

  return {
    imageUrl,
    blurHash: photo.blur_hash ?? null,
    photographer: photo.user?.name ?? null,
    photographerUrl: photo.user?.links?.html ?? null,
    sourceUrl,
    sourceName: HERO_SOURCE.UNSPLASH,
    unsplashUrl: sourceUrl,
    queryUsed,
  };
}

/**
 * @param {string} query
 * @param {'landscape' | 'portrait'} orientation
 * @param {{
 *   fetchImpl?: typeof fetch,
 *   accessKey?: string,
 *   excludePhotoIds?: string[],
 *   excludeImageUrls?: string[],
 *   match?: 'place' | 'region' | 'none',
 *   place?: {
 *     city?: string | null,
 *     state?: string | null,
 *     countryName?: string | null,
 *     countryCode?: string | null,
 *     lat?: number | null,
 *     lon?: number | null,
 *   },
 * }} [deps]
 */
export async function searchUnsplashHeroImage(query, orientation, deps = {}) {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const accessKey = deps.accessKey ?? process.env.UNSPLASH_ACCESS_KEY?.trim();

  if (!accessKey || !query?.trim() || deps.rateLimited?.current) {
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

    if (response.status === 403 || response.status === 429) {
      if (deps.rateLimited) {
        deps.rateLimited.current = true;
      }
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const photo = pickHeroPhoto(payload?.results, orientation, {
      random: true,
      excludePhotoIds: deps.excludePhotoIds,
      excludeImageUrls: deps.excludeImageUrls,
      match: deps.match ?? 'none',
      place: deps.place,
    });

    return mapUnsplashPhoto(photo, query.trim(), orientation);
  } catch {
    return null;
  }
}

/**
 * @param {{ query: string, match: 'place' | 'region' | 'none' }[]} queries
 * @param {'landscape' | 'portrait'} orientation
 * @param {{
 *   fetchImpl?: typeof fetch,
 *   accessKey?: string,
 *   excludePhotoIds?: string[],
 *   excludeImageUrls?: string[],
 *   place?: {
 *     city?: string | null,
 *     state?: string | null,
 *     countryName?: string | null,
 *     countryCode?: string | null,
 *     lat?: number | null,
 *     lon?: number | null,
 *   },
 * }} deps
 */
async function resolveOrientation(queries, orientation, deps) {
  for (const entry of queries) {
    if (deps.rateLimited?.current) {
      break;
    }

    const image = await searchUnsplashHeroImage(entry.query, orientation, {
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
export async function resolveUnsplashHeroImage(region, deps = {}) {
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

  // Shared flag so a 403/429 stops the whole Unsplash query fan-out and lets
  // Wikimedia/Pexels run instead of burning the remaining hourly quota.
  const rateLimited = { current: false };

  const landscapeDeps = {
    ...deps,
    place,
    rateLimited,
    excludeImageUrls: deps.excludeLandscapeUrl ? [deps.excludeLandscapeUrl] : undefined,
  };
  const portraitDeps = {
    ...deps,
    place,
    rateLimited,
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
    sourceUrl: primary?.sourceUrl ?? primary?.unsplashUrl ?? null,
    sourceName: HERO_SOURCE.UNSPLASH,
    unsplashUrl: primary?.unsplashUrl ?? primary?.sourceUrl ?? null,
  };
}
