import { STORAGE_KEYS } from '@/constants/storage-keys';
import { buildCityId } from '@/lib/utils';
import { recordLocationCheckForProfile } from '@/features/cities/utils/user-location-profile';
import { writeLocalStorageValue } from '@/hooks/use-browser-storage';

function readCheckedCitiesMap() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.checkedCities);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCheckedCitiesMap(map) {
  writeLocalStorageValue(STORAGE_KEYS.checkedCities, JSON.stringify(map));
}

export function normalizeCheckedCity(city) {
  const id = city.id ?? buildCityId(city.name, city.country, city.lat);

  return {
    id,
    name: city.name,
    country: city.country,
    state: city.state ?? null,
    lat: city.lat,
    lon: city.lon,
    label: city.label ?? [city.name, city.state, city.country].filter(Boolean).join(', '),
  };
}

export function stashCheckedCity(city) {
  const normalized = normalizeCheckedCity(city);
  const map = readCheckedCitiesMap();
  map[normalized.id] = normalized;
  writeCheckedCitiesMap(map);
  recordLocationCheckForProfile(normalized);
  return normalized;
}

export function readCheckedCity(cityId) {
  return readCheckedCitiesMap()[cityId] ?? null;
}
