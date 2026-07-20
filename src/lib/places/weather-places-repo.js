import { getDb } from '@/lib/db';
import { buildCityId } from '@/lib/utils';

function mapWeatherPlaceRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    country: row.country,
    adminArea: row.admin_area ?? null,
    lat: row.lat,
    lon: row.lon,
    population: row.population ?? 0,
    placeType: row.place_type ?? 'city',
    tier: row.tier ?? 3,
    citySlug: row.city_slug ?? null,
    viewCount: row.view_count ?? 0,
    lastViewedAt: row.last_viewed_at ?? null,
    lastFetchedAt: row.last_fetched_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

export function weatherPlaceToCityRecord(place) {
  if (!place?.name || !place?.country || place.lat == null || place.lon == null) {
    return null;
  }

  return {
    id: place.citySlug ?? buildCityId(place.name, place.country, place.lat),
    name: place.name,
    country: place.country,
    state: place.adminArea ?? null,
    lat: place.lat,
    lon: place.lon,
    seoSlug: place.slug,
    placeType: place.placeType ?? null,
    population: place.population ?? null,
  };
}

export function findWeatherPlaceBySlug(slug) {
  if (!slug) {
    return null;
  }

  const row = getDb()
    .prepare('SELECT * FROM weather_places WHERE slug = ?')
    .get(decodeURIComponent(slug));

  return mapWeatherPlaceRow(row);
}

export function findWeatherPlaceByCountrySlug(country, slug) {
  if (!country || !slug) {
    return null;
  }

  const row = getDb()
    .prepare('SELECT * FROM weather_places WHERE country = ? AND slug = ?')
    .get(String(country).toUpperCase(), decodeURIComponent(slug));

  return mapWeatherPlaceRow(row);
}

export function countWeatherPlaces() {
  const row = getDb().prepare('SELECT COUNT(*) AS count FROM weather_places').get();
  return row?.count ?? 0;
}

/**
 * Global place inventory scaffold — no world seed in this pass.
 * Callers may upsert curated rows later (Phase C).
 */
export function upsertWeatherPlace(place) {
  if (!place?.slug || !place?.name || !place?.country) {
    return null;
  }

  const now = new Date().toISOString();
  const citySlug = buildCityId(place.name, place.country, place.lat);
  getDb()
    .prepare(
      `INSERT INTO weather_places (
         id, slug, name, country, admin_area, lat, lon, population, place_type, tier, city_slug,
         view_count, last_viewed_at, last_fetched_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, NULL, ?)
       ON CONFLICT(slug) DO UPDATE SET
         name = excluded.name,
         country = excluded.country,
         admin_area = excluded.admin_area,
         lat = excluded.lat,
         lon = excluded.lon,
         population = excluded.population,
         place_type = excluded.place_type,
         tier = excluded.tier,
         city_slug = excluded.city_slug,
         updated_at = excluded.updated_at`,
    )
    .run(
      place.slug,
      place.slug,
      place.name,
      String(place.country).toUpperCase(),
      place.adminArea ?? null,
      place.lat,
      place.lon,
      place.population ?? 0,
      place.placeType ?? 'city',
      place.tier ?? 3,
      citySlug,
      now,
    );

  return findWeatherPlaceBySlug(place.slug);
}
