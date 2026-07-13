'use client';

import { useCallback, useEffect, useState } from 'react';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import {
  FORCE_REFRESH_MAX_AGE_MS,
  loadWeatherBatchForCity,
  mergeBatchScopes,
  persistBatchScopes,
} from '@/features/weather/utils/weather-batch-client';
import {
  prefetchWeatherBatch,
  readLocalWeatherCache,
  writeLocalWeatherCache,
} from '@/features/weather/utils/weather-cache';
import { useWeatherRefreshMode } from '@/providers/WeatherRefreshModeProvider';

const DETAIL_SCOPES = ['current', 'hourly', 'daily', 'minutely'];

function buildInitialScopes(initialScopes) {
  if (!initialScopes) {
    return {};
  }

  const merged = {};
  for (const scope of DETAIL_SCOPES) {
    if (initialScopes[scope]?.data) {
      merged[scope] = initialScopes[scope];
    }
  }

  return merged;
}

export function useCityWeather(city, isHydrated, initialScopes = null) {
  const { isManual } = useWeatherRefreshMode();
  const [scopes, setScopes] = useState(() => buildInitialScopes(initialScopes));
  const [isLoading, setIsLoading] = useState(!initialScopes?.current?.data);
  const [error, setError] = useState(null);

  const load = useCallback(async ({ force = false } = {}) => {
    if (!isHydrated || !city) return;

    const initial = buildInitialScopes(initialScopes);
    for (const scope of DETAIL_SCOPES) {
      if (initial[scope]) {
        continue;
      }

      const cached = readLocalWeatherCache(city.id, scope);
      if (cached?.payload) {
        initial[scope] = {
          data: cached.payload,
          meta: { fetchedAt: cached.fetchedAt, cacheLayer: 'client' },
        };
      }
    }
    setScopes(initial);
    setError(null);

    const hasCurrentCache = Boolean(initial.current?.data);
    if (isManual && hasCurrentCache && !force) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const entry = await loadWeatherBatchForCity({
        lat: city.lat,
        lon: city.lon,
        scopes: DETAIL_SCOPES,
        maxAgeMs: force ? FORCE_REFRESH_MAX_AGE_MS : undefined,
        trigger: WEATHER_CHECK_TRIGGERS.cityDetail,
      });

      persistBatchScopes(entry, DETAIL_SCOPES, (scope, payload) => {
        writeLocalWeatherCache(city.id, scope, payload);
      });

      setScopes(mergeBatchScopes(entry, DETAIL_SCOPES, { target: initial }));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, [city, initialScopes, isHydrated, isManual]);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) {
        void load();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [load]);

  const refresh = useCallback(() => load({ force: true }), [load]);

  return { scopes, isLoading, error, refresh };
}

export async function prefetchCityDetail(city) {
  if (!city) return;
  return prefetchWeatherBatch({
    lat: city.lat,
    lon: city.lon,
    cityId: city.id,
    scopes: ['hourly', 'daily'],
    trigger: WEATHER_CHECK_TRIGGERS.cityDetail,
  });
}
