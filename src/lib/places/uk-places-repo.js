import { getDb } from '@/lib/db';
import { buildCityId } from '@/lib/utils';
import { UK_PLACE_TIER_A, UK_PLACES_PHASE_A } from '@/constants/uk-places-phase-a';

function mapPlaceRow(row) {
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
    placeType: row.place_type ?? 'town',
    tier: row.tier ?? UK_PLACE_TIER_A,
    citySlug: row.city_slug ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

export function ukPlaceToCityRecord(place) {
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

export function findUkPlaceBySlug(slug) {
  if (!slug) {
    return null;
  }

  const row = getDb()
    .prepare('SELECT * FROM uk_places WHERE slug = ?')
    .get(decodeURIComponent(slug));

  return mapPlaceRow(row);
}

export function findUkPlaceByCitySlug(citySlug) {
  if (!citySlug) {
    return null;
  }

  const row = getDb()
    .prepare('SELECT * FROM uk_places WHERE city_slug = ?')
    .get(citySlug);

  return mapPlaceRow(row);
}

export function findUkPlaceNearCoords(lat, lon, country = 'GB') {
  const roundedLat = Number(Number(lat).toFixed(4));
  const roundedLon = Number(Number(lon).toFixed(4));

  const row = getDb()
    .prepare(
      `SELECT * FROM uk_places
       WHERE country = ?
         AND ABS(lat - ?) < 0.02
         AND ABS(lon - ?) < 0.02
       ORDER BY population DESC
       LIMIT 1`,
    )
    .get(country.toUpperCase(), roundedLat, roundedLon);

  return mapPlaceRow(row);
}

export function listUkPlaces({ tier = null, limit = 5000 } = {}) {
  if (tier != null) {
    return getDb()
      .prepare(
        `SELECT * FROM uk_places
         WHERE tier <= ?
         ORDER BY population DESC
         LIMIT ?`,
      )
      .all(tier, limit)
      .map(mapPlaceRow);
  }

  return getDb()
    .prepare(
      `SELECT * FROM uk_places
       ORDER BY population DESC
       LIMIT ?`,
    )
    .all(limit)
    .map(mapPlaceRow);
}

export function countUkPlaces() {
  const row = getDb().prepare('SELECT COUNT(*) AS count FROM uk_places').get();
  return row?.count ?? 0;
}

/**
 * Upsert Phase A constants into SQLite. Safe to re-run.
 * @returns {{ inserted: number, updated: number, total: number }}
 */
export function seedUkPlacesPhaseA(places = UK_PLACES_PHASE_A) {
  const database = getDb();
  const now = new Date().toISOString();
  const upsert = database.prepare(
    `INSERT INTO uk_places (
       id, slug, name, country, admin_area, lat, lon, population, place_type, tier, city_slug, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  );

  const existing = database.prepare('SELECT slug FROM uk_places').all();
  const existingSlugs = new Set(existing.map((row) => row.slug));
  let inserted = 0;
  let updated = 0;

  const run = database.transaction((rows) => {
    for (const place of rows) {
      const citySlug = buildCityId(place.name, place.country, place.lat);
      const id = place.slug;
      const wasExisting = existingSlugs.has(place.slug);
      upsert.run(
        id,
        place.slug,
        place.name,
        place.country,
        place.adminArea ?? null,
        place.lat,
        place.lon,
        place.population ?? 0,
        place.placeType ?? 'town',
        place.tier ?? UK_PLACE_TIER_A,
        citySlug,
        now,
      );
      if (wasExisting) {
        updated += 1;
      } else {
        inserted += 1;
      }
    }
  });

  run(places);

  return {
    inserted,
    updated,
    total: countUkPlaces(),
  };
}

/**
 * Resolve a weather place slug to a city record for weather UI + SEO.
 */
export function resolveWeatherPlace(placeSlug) {
  const place = findUkPlaceBySlug(placeSlug);
  if (!place) {
    return null;
  }

  return ukPlaceToCityRecord(place);
}
