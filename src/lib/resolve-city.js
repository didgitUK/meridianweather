import { PLATFORM_SHOWCASE_CITIES } from '@/constants/platform';
import {
  findLocationByCitySlug,
  findLocationByLatCountry,
  locationToCityRecord,
} from '@/lib/location-repo';
import {
  findUkPlaceByCitySlug,
  ukPlaceToCityRecord,
} from '@/lib/places/uk-places-repo';
import { buildCityId, parseCityId } from '@/lib/utils';

function showcaseCityToRecord(city) {
  return {
    id: buildCityId(city.name, city.country, city.lat),
    name: city.name,
    country: city.country,
    state: city.state ?? null,
    lat: city.lat,
    lon: city.lon,
  };
}

const SHOWCASE_BY_ID = new Map(
  PLATFORM_SHOWCASE_CITIES.map((city) => [showcaseCityToRecord(city).id, showcaseCityToRecord(city)]),
);

export function getShowcaseCities() {
  return [...SHOWCASE_BY_ID.values()];
}

function resolveUkPlaceFallback(decodedId) {
  return ukPlaceToCityRecord(findUkPlaceByCitySlug(decodedId));
}

export function resolveCity(cityId) {
  if (!cityId) {
    return null;
  }

  const decodedId = decodeURIComponent(cityId);
  const showcaseMatch = SHOWCASE_BY_ID.get(decodedId);
  if (showcaseMatch) {
    return showcaseMatch;
  }

  const bySlug = locationToCityRecord(findLocationByCitySlug(decodedId));
  if (bySlug) {
    return bySlug;
  }

  const parsed = parseCityId(decodedId);
  if (parsed) {
    const byLatCountry = locationToCityRecord(
      findLocationByLatCountry(parsed.lat, parsed.country),
    );
    if (byLatCountry) {
      return byLatCountry;
    }
  }

  const ukFallback = resolveUkPlaceFallback(decodedId);
  if (ukFallback) {
    return ukFallback;
  }

  return null;
}
