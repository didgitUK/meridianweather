import { slugify } from '@/lib/utils';
import { fetchGeocode } from '@/lib/weather/geocode';
import { normalizePlaceSlug } from '@/lib/places/normalize-place-slug';
import { resolveWeatherPlace } from '@/lib/places/uk-places-repo';
import {
  upsertWeatherPlace,
  weatherPlaceToCityRecord,
} from '@/lib/places/weather-places-repo';

function readParam(searchParams, key) {
  if (!searchParams) {
    return null;
  }
  if (typeof searchParams.get === 'function') {
    return searchParams.get(key);
  }
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value ?? null;
}

function cityFromCoords({ slug, name, country, state, lat, lon }) {
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const place = upsertWeatherPlace({
    slug,
    name,
    country: country || 'GB',
    adminArea: state || null,
    lat,
    lon,
    tier: 3,
    placeType: 'locality',
  });

  return weatherPlaceToCityRecord(place) ?? resolveWeatherPlace(slug);
}

/**
 * Resolve a weather place for the detail page.
 * Prefer seeded inventory; else create from query coords; else geocode the slug.
 */
export async function resolveWeatherPlaceOrCreate(placeSlug, searchParams = null) {
  const slug = normalizePlaceSlug(placeSlug);
  if (!slug) {
    return null;
  }

  const existing = resolveWeatherPlace(slug);
  if (existing) {
    return existing;
  }

  const lat = Number(readParam(searchParams, 'lat'));
  const lon = Number(readParam(searchParams, 'lon'));
  const name = readParam(searchParams, 'name')?.trim() || null;
  const country = (readParam(searchParams, 'country') || 'GB').toUpperCase();
  const state = readParam(searchParams, 'state')?.trim() || null;

  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    const displayName = name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return cityFromCoords({
      slug,
      name: displayName,
      country,
      state,
      lat,
      lon,
    });
  }

  const query = name || slug.replace(/-/g, ' ');
  try {
    const geocode = await fetchGeocode(query, { countryHint: country });
    const results = geocode?.data?.results ?? [];
    const preferred =
      results.find((row) => {
        const rowCountry = String(row.country ?? '').toUpperCase();
        const rowSlug = slugify(row.name ?? '');
        return (rowCountry === country || rowCountry === 'UK') && rowSlug === slug;
      })
      ?? results.find((row) => {
        const rowCountry = String(row.country ?? '').toUpperCase();
        return rowCountry === country || rowCountry === 'UK';
      })
      ?? results[0]
      ?? null;

    if (!preferred?.lat || preferred.lon == null) {
      return null;
    }

    return cityFromCoords({
      slug,
      name: preferred.name,
      country: String(preferred.country ?? country).toUpperCase(),
      state: preferred.state ?? state,
      lat: Number(preferred.lat),
      lon: Number(preferred.lon),
    });
  } catch {
    return null;
  }
}
