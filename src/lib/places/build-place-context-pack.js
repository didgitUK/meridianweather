import { createHash } from 'crypto';
import {
  PLACE_GUIDE_CATEGORY,
  PLACE_GUIDE_PROMPT_VERSION,
  PLACE_POI_CATEGORY_ORDER,
} from '@/constants/place-content';
import { listPlaceLocalLinks } from '@/lib/places/place-local-links-repo';
import { listPlacePois } from '@/lib/places/place-pois-repo';
import { fetchWikipediaPlaceAbstract } from '@/lib/places/wikipedia-place-context';

/**
 * @param {unknown} weather
 */
function summarizeWeather(weather) {
  if (!weather) {
    return null;
  }

  const current = weather.current ?? weather;
  const temp = current?.temp ?? current?.main?.temp ?? null;
  const feelsLike = current?.feels_like ?? current?.main?.feels_like ?? null;
  const description =
    current?.weather?.[0]?.description
    ?? current?.weather?.[0]?.main
    ?? null;
  const humidity = current?.humidity ?? current?.main?.humidity ?? null;
  const wind = current?.wind_speed ?? current?.wind?.speed ?? null;

  const daily = Array.isArray(weather.daily) ? weather.daily.slice(0, 5) : [];
  const dailyBrief = daily.map((day) => ({
    dt: day.dt ?? null,
    min: day.temp?.min ?? null,
    max: day.temp?.max ?? null,
    pop: day.pop ?? null,
    summary: day.weather?.[0]?.description ?? null,
  }));

  return {
    temp,
    feelsLike,
    description,
    humidity,
    wind,
    dailyBrief,
  };
}

/**
 * @param {Array<{ category: string, name: string, distanceKm?: number }>} pois
 */
function groupPois(pois) {
  const groups = {};
  for (const category of PLACE_POI_CATEGORY_ORDER) {
    groups[category] = [];
  }

  for (const poi of pois) {
    if (!groups[poi.category]) {
      groups[poi.category] = [];
    }
    if (groups[poi.category].length >= 8) {
      continue;
    }
    groups[poi.category].push({
      name: poi.name,
      distanceKm: poi.distanceKm ?? null,
    });
  }

  return groups;
}

/**
 * @param {{
 *   place: {
 *     slug: string,
 *     name: string,
 *     adminArea?: string | null,
 *     state?: string | null,
 *     country?: string | null,
 *     lat: number,
 *     lon: number,
 *     population?: number,
 *     placeType?: string,
 *   },
 *   weather?: unknown,
 *   fetchImpl?: typeof fetch,
 * }} input
 */
export async function buildPlaceContextPack(input) {
  const place = input.place;
  const adminArea = place.adminArea ?? place.state ?? null;
  const pois = listPlacePois(place.slug);
  const localLinks = listPlaceLocalLinks(place.slug);
  const wiki = await fetchWikipediaPlaceAbstract({
    name: place.name,
    adminArea,
    country: place.country ?? 'GB',
    fetchImpl: input.fetchImpl,
  });

  const weatherSummary = summarizeWeather(input.weather);
  const poiGroups = groupPois(pois);

  const sources = [];
  if (wiki?.url) {
    sources.push({
      title: wiki.title,
      url: wiki.url,
      publisher: wiki.source,
    });
  }
  sources.push({
    title: 'OpenStreetMap',
    url: `https://www.openstreetmap.org/#map=14/${place.lat}/${place.lon}`,
    publisher: 'OpenStreetMap',
  });
  sources.push({
    title: `${place.name} weather on Meridian`,
    url: `/weather/${place.slug}`,
    publisher: 'Meridian Weather',
  });
  for (const link of localLinks) {
    sources.push({
      title: link.title,
      url: link.url,
      publisher: link.publisher || 'Local coverage',
    });
  }

  const pack = {
    promptVersion: PLACE_GUIDE_PROMPT_VERSION,
    guideCategory: PLACE_GUIDE_CATEGORY,
    place: {
      slug: place.slug,
      name: place.name,
      adminArea,
      country: place.country ?? 'GB',
      lat: place.lat,
      lon: place.lon,
      population: place.population ?? 0,
      placeType: place.placeType ?? 'town',
    },
    weather: weatherSummary,
    pois: poiGroups,
    wikipedia: wiki,
    localHeadlines: localLinks.map((link) => ({
      title: link.title,
      url: link.url,
      publisher: link.publisher,
    })),
    sources,
    generatedForDate: new Date().toISOString().slice(0, 10),
  };

  const contextHash = createHash('sha256')
    .update(JSON.stringify({
      slug: pack.place.slug,
      weather: pack.weather,
      pois: pack.pois,
      wikiTitle: pack.wikipedia?.title ?? null,
      date: pack.generatedForDate,
      promptVersion: pack.promptVersion,
    }))
    .digest('hex')
    .slice(0, 24);

  return { ...pack, contextHash };
}
