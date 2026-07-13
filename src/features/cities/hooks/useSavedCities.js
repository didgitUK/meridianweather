'use client';

import { useCallback, useEffect, useMemo, useSyncExternalStore, useState } from 'react';
import { MAX_SAVED_CITIES } from '@/constants/weather';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { buildCityId } from '@/lib/utils';
import { clearWeatherCacheForCity } from '@/features/weather/utils/weather-cache';
import { useHasMounted, writeLocalStorageValue } from '@/hooks/use-browser-storage';
import { toast } from 'sonner';

const EMPTY_CITIES = [];

function subscribe(onStoreChange) {
  const handler = () => onStoreChange();
  window.addEventListener('meridian:storage', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('meridian:storage', handler);
    window.removeEventListener('storage', handler);
  };
}

function readSavedCitiesRaw() {
  return window.localStorage.getItem(STORAGE_KEYS.savedCities) ?? '';
}

function parseSavedCities(raw) {
  if (!raw) return EMPTY_CITIES;

  try {
    return JSON.parse(raw);
  } catch {
    return EMPTY_CITIES;
  }
}

function readSavedCities() {
  return parseSavedCities(readSavedCitiesRaw());
}

function writeSavedCities(cities) {
  writeLocalStorageValue(STORAGE_KEYS.savedCities, JSON.stringify(cities));
}

export function useSavedCities() {
  const isHydrated = useHasMounted();
  const [maxSavedCities, setMaxSavedCities] = useState(MAX_SAVED_CITIES);
  const savedCitiesRaw = useSyncExternalStore(subscribe, readSavedCitiesRaw, () => '');
  const savedCities = useMemo(() => parseSavedCities(savedCitiesRaw), [savedCitiesRaw]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    fetch('/api/platform/limits')
      .then((response) => response.json())
      .then((payload) => {
        if (Number.isFinite(payload.maxSavedCities)) {
          setMaxSavedCities(payload.maxSavedCities);
        }
      })
      .catch(() => {});
  }, [isHydrated]);

  const addCity = useCallback((city) => {
    const id = buildCityId(city.name, city.country, city.lat);
    const current = readSavedCities();

    if (current.some((item) => item.id === id)) {
      toast.message('Already pinned to your locations');
      return;
    }

    if (current.length >= maxSavedCities) {
      toast.error(`You can monitor up to ${maxSavedCities} cities`);
      return;
    }

    writeSavedCities([...current, { ...city, id }]);
  }, [maxSavedCities]);

  const removeCity = useCallback((id) => {
    clearWeatherCacheForCity(id);
    writeSavedCities(readSavedCities().filter((city) => city.id !== id));
  }, []);

  return {
    savedCities,
    isHydrated,
    maxSavedCities,
    addCity,
    removeCity,
  };
}
