import {
  PWA_META_CACHE,
  PWA_MAX_PRIORITY_CITIES,
  PWA_PRIORITY_CITIES_URL,
  PWA_PRIORITY_RECENT_LIMIT,
} from '@/constants/pwa';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { listRecentCheckedCities } from '@/features/cities/utils/checked-city-store';

function readSavedCities() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.savedCities);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeCity(city) {
  if (!city?.id || !Number.isFinite(Number(city.lat)) || !Number.isFinite(Number(city.lon))) {
    return null;
  }

  return {
    id: city.id,
    name: city.name ?? null,
    country: city.country ?? null,
    state: city.state ?? null,
    lat: Number(city.lat),
    lon: Number(city.lon),
    label: city.label ?? null,
  };
}

/**
 * Pinned cities first, then recent checks not already pinned (deduped by id).
 */
export function buildPriorityCities({
  savedCities,
  recentLimit = PWA_PRIORITY_RECENT_LIMIT,
  maxCities = PWA_MAX_PRIORITY_CITIES,
} = {}) {
  const pinned = (savedCities ?? readSavedCities())
    .map(normalizeCity)
    .filter(Boolean);

  const seen = new Set(pinned.map((city) => city.id));
  const recent = listRecentCheckedCities(recentLimit)
    .map(normalizeCity)
    .filter((city) => city && !seen.has(city.id));

  return [...pinned, ...recent].slice(0, maxCities);
}

/**
 * Mirror priority cities into Cache API so the service worker can read them when closed.
 */
export async function syncPriorityCitiesToServiceWorker(cities = buildPriorityCities()) {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return cities;
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    cities,
  };

  const cache = await caches.open(PWA_META_CACHE);
  await cache.put(
    PWA_PRIORITY_CITIES_URL,
    new Response(JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  return cities;
}
