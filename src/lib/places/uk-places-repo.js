import { getDb } from '@/lib/db';
import { buildCityId } from '@/lib/utils';
import { UK_PLACE_TIER_A, UK_PLACES_PHASE_A } from '@/constants/uk-places-phase-a';
import { UK_PLACE_TIER_B, UK_PLACES_PHASE_B } from '@/constants/uk-places-phase-b';
import { PLACE_SEO_HOT_REFRESH_LIMIT } from '@/constants/weather-places';
import { normalizePlaceSlug } from '@/lib/places/normalize-place-slug';
import {
  findWeatherPlaceBySlug,
  weatherPlaceToCityRecord,
} from '@/lib/places/weather-places-repo';

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
    viewCount: row.view_count ?? 0,
    lastViewedAt: row.last_viewed_at ?? null,
    lastFetchedAt: row.last_fetched_at ?? null,
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
    tier: place.tier ?? null,
    viewCount: place.viewCount ?? 0,
    lastViewedAt: place.lastViewedAt ?? null,
  };
}

export function findUkPlaceBySlug(slug) {
  const normalized = normalizePlaceSlug(slug);
  if (!normalized) {
    return null;
  }

  const row = getDb()
    .prepare('SELECT * FROM uk_places WHERE slug = ?')
    .get(normalized);

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

/**
 * Hot SEO refresh candidates: curated tier-1 first, then highest view counts.
 */
export function listHotUkPlacesForRefresh(limit = PLACE_SEO_HOT_REFRESH_LIMIT) {
  return getDb()
    .prepare(
      `SELECT * FROM uk_places
       ORDER BY
         CASE WHEN tier = 1 THEN 0 ELSE 1 END,
         view_count DESC,
         population DESC
       LIMIT ?`,
    )
    .all(limit)
    .map(mapPlaceRow);
}

export function countUkPlaces() {
  const row = getDb().prepare('SELECT COUNT(*) AS count FROM uk_places').get();
  return row?.count ?? 0;
}

export function recordUkPlaceView(slug) {
  const normalized = normalizePlaceSlug(slug);
  if (!normalized) {
    return;
  }

  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE uk_places
       SET view_count = view_count + 1,
           last_viewed_at = ?
       WHERE slug = ?`,
    )
    .run(now, normalized);
}

export function recordUkPlaceFetched(slug) {
  const normalized = normalizePlaceSlug(slug);
  if (!normalized) {
    return;
  }

  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE uk_places
       SET last_fetched_at = ?
       WHERE slug = ?`,
    )
    .run(now, normalized);
}

function upsertUkPlaces(places, defaultTier) {
  const database = getDb();
  const now = new Date().toISOString();
  const upsert = database.prepare(
    `INSERT INTO uk_places (
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
        place.tier ?? defaultTier,
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
 * Upsert Phase A constants into SQLite. Safe to re-run.
 * @returns {{ inserted: number, updated: number, total: number }}
 */
export function seedUkPlacesPhaseA(places = UK_PLACES_PHASE_A) {
  return upsertUkPlaces(places, UK_PLACE_TIER_A);
}

/**
 * Upsert Phase B constants (next popularity band). Safe to re-run.
 */
export function seedUkPlacesPhaseB(places = UK_PLACES_PHASE_B) {
  return upsertUkPlaces(places, UK_PLACE_TIER_B);
}

export function seedAllUkPlaces() {
  const phaseA = seedUkPlacesPhaseA();
  const phaseB = seedUkPlacesPhaseB();
  return {
    phaseA,
    phaseB,
    total: countUkPlaces(),
  };
}

/**
 * Resolve a weather place slug to a city record for weather UI + SEO.
 * Prefers UK inventory, then global weather_places scaffold.
 */
export function resolveWeatherPlace(placeSlug) {
  const place = findUkPlaceBySlug(placeSlug);
  if (place) {
    return ukPlaceToCityRecord(place);
  }

  const globalPlace = findWeatherPlaceBySlug(placeSlug);
  if (!globalPlace) {
    return null;
  }

  return weatherPlaceToCityRecord(globalPlace);
}
