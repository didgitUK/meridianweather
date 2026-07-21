'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  DASHBOARD_CURRENT_MAX_AGE_MS,
  OFFLINE_EMERGENCY_STALE_MAX_MS,
  SCOPE_TTL,
} from '@/constants/weather';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { resolveOpenWeatherLang } from '@/i18n/locales';
import {
  cacheMeetsMaxAge,
  getSnapshotAgeMs,
} from '@/lib/weather-cache-age';
import {
  FORCE_REFRESH_MAX_AGE_MS,
  loadWeatherBatch,
  mergeBatchScopes,
  persistBatchScopes,
} from '@/features/weather/utils/weather-batch-client';
import {
  prefetchWeatherBatch,
  readLocalWeatherCache,
  writeLocalWeatherCache,
} from '@/features/weather/utils/weather-cache';
import { useWeatherRefreshMode } from '@/providers/WeatherRefreshModeProvider';

const DASHBOARD_SCOPES = ['current', 'daily'];
const DASHBOARD_MAX_AGE_MS = {
  current: DASHBOARD_CURRENT_MAX_AGE_MS,
  daily: SCOPE_TTL.daily.fresh,
};

function readCachedScopeState(cityId, scope) {
  const cached = readLocalWeatherCache(cityId, scope);
  if (!cached?.payload) {
    return null;
  }

  const fetchedAt = cached.fetchedAt ?? null;
  const ageMs = getSnapshotAgeMs(fetchedAt);
  if (ageMs != null && ageMs > OFFLINE_EMERGENCY_STALE_MAX_MS) {
    return null;
  }

  const maxAgeMs = DASHBOARD_MAX_AGE_MS[scope] ?? null;
  const withinFreshWindow = cacheMeetsMaxAge({ meta: { fetchedAt } }, maxAgeMs);

  return {
    data: cached.payload,
    meta: {
      freshness: withinFreshWindow ? 'acceptable' : 'stale',
      fetchedAt,
      ageMs,
      cacheLayer: 'client',
    },
  };
}

function applyBatchEntry(city, entry, mergedWeather, mergedForecast) {
  const merged = mergeBatchScopes(entry, DASHBOARD_SCOPES);
  persistBatchScopes(entry, DASHBOARD_SCOPES, (scope, payload) => {
    writeLocalWeatherCache(city.id, scope, payload);
  });

  const currentPayload = merged.current;
  if (currentPayload?.error) {
    const existing = mergedWeather[city.id];
    if (existing?.data) {
      mergedWeather[city.id] = {
        data: existing.data,
        meta: existing.meta,
        warning: currentPayload.error,
      };
    } else {
      mergedWeather[city.id] = { error: currentPayload.error };
    }
  } else if (currentPayload?.data) {
    mergedWeather[city.id] = {
      data: currentPayload.data,
      meta: currentPayload.meta,
    };
  }

  const dailyPayload = merged.daily;
  if (dailyPayload?.error) {
    const existingDaily = mergedForecast[city.id]?.data;
    if (!existingDaily?.points?.length) {
      mergedForecast[city.id] = {
        error: dailyPayload.error,
        loading: false,
      };
    }
  } else if (dailyPayload?.data?.points?.length) {
    mergedForecast[city.id] = {
      data: dailyPayload.data,
      meta: dailyPayload.meta,
      loading: false,
    };
  }
}

export function useWeatherData(savedCities, isHydrated) {
  const locale = useLocale();
  const weatherLang = resolveOpenWeatherLang(locale);
  const { isManual } = useWeatherRefreshMode();
  const [weatherByCity, setWeatherByCity] = useState({});
  const [forecastByCity, setForecastByCity] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [refreshingCityIds, setRefreshingCityIds] = useState({});
  const loadGenerationRef = useRef(0);

  const loadWeather = useCallback(async () => {
    if (!isHydrated || savedCities.length === 0) {
      setWeatherByCity({});
      setForecastByCity({});
      return;
    }

    const generation = ++loadGenerationRef.current;
    setIsLoading(true);

    const nextWeatherState = {};
    const nextForecastState = {};

    for (const city of savedCities) {
      const cachedCurrent = readCachedScopeState(city.id, 'current');
      if (cachedCurrent) {
        nextWeatherState[city.id] = cachedCurrent;
      }

      const cachedDaily = readCachedScopeState(city.id, 'daily');
      if (cachedDaily?.data?.points?.length) {
        nextForecastState[city.id] = {
          data: cachedDaily.data,
          meta: cachedDaily.meta,
          loading: false,
        };
      }
    }

    if (generation !== loadGenerationRef.current) {
      return;
    }

    setWeatherByCity(nextWeatherState);
    setForecastByCity(nextForecastState);

    const citiesToFetch = isManual
      ? savedCities.filter((city) => !nextWeatherState[city.id]?.data)
      : savedCities;

    if (citiesToFetch.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const payload = await loadWeatherBatch(
        citiesToFetch.map((city) => ({
          lat: city.lat,
          lon: city.lon,
          scopes: DASHBOARD_SCOPES,
          maxAgeMs: DASHBOARD_MAX_AGE_MS,
          trigger: WEATHER_CHECK_TRIGGERS.dashboardLoad,
          lang: weatherLang,
        })),
        { trigger: WEATHER_CHECK_TRIGGERS.dashboardLoad, lang: weatherLang },
      );

      if (generation !== loadGenerationRef.current) {
        return;
      }

      const mergedWeather = { ...nextWeatherState };
      const mergedForecast = { ...nextForecastState };

      payload.cities.forEach((entry, index) => {
        const city = citiesToFetch[index];
        if (!city) {
          return;
        }

        applyBatchEntry(city, entry, mergedWeather, mergedForecast);
      });

      setWeatherByCity(mergedWeather);
      setForecastByCity(mergedForecast);
    } catch (error) {
      if (generation !== loadGenerationRef.current) {
        return;
      }
      setWeatherByCity((current) => {
        const fallback = { ...current };
        for (const city of citiesToFetch) {
          const existing = fallback[city.id];
          if (existing?.data) {
            fallback[city.id] = {
              ...existing,
              meta: {
                ...existing.meta,
                freshness: 'stale',
                offline: true,
              },
              warning: existing.warning ?? error.message,
            };
          } else {
            fallback[city.id] = { error: error.message };
          }
        }
        return fallback;
      });

      setForecastByCity((current) => {
        const fallback = { ...current };
        for (const city of citiesToFetch) {
          const existing = fallback[city.id];
          if (existing?.data?.points?.length) {
            fallback[city.id] = {
              ...existing,
              meta: {
                ...existing.meta,
                freshness: 'stale',
                offline: true,
              },
              loading: false,
            };
          } else if (!fallback[city.id]) {
            fallback[city.id] = { error: error.message, loading: false };
          }
        }
        return fallback;
      });
    } finally {
      if (generation === loadGenerationRef.current) {
        setIsLoading(false);
      }
    }
  }, [isHydrated, isManual, savedCities, weatherLang]);

  const refreshCityWeather = useCallback(async (city) => {
    if (!city?.lat || !city?.lon) {
      return;
    }

    setRefreshingCityIds((current) => ({ ...current, [city.id]: true }));

    try {
      const payload = await loadWeatherBatch([
        {
          lat: city.lat,
          lon: city.lon,
          scopes: DASHBOARD_SCOPES,
          maxAgeMs: {
            current: FORCE_REFRESH_MAX_AGE_MS,
            daily: FORCE_REFRESH_MAX_AGE_MS,
          },
          trigger: WEATHER_CHECK_TRIGGERS.dashboardRefresh,
          lang: weatherLang,
        },
      ], { trigger: WEATHER_CHECK_TRIGGERS.dashboardRefresh, lang: weatherLang });

      const entry = payload.cities?.[0];
      if (!entry) {
        return;
      }

      setWeatherByCity((current) => {
        const next = { ...current };
        applyBatchEntry(city, entry, next, {});
        return next;
      });

      setForecastByCity((current) => {
        const next = { ...current };
        applyBatchEntry(city, entry, {}, next);
        return next;
      });
    } catch (error) {
      setWeatherByCity((current) => ({
        ...current,
        [city.id]: current[city.id]?.data
          ? { ...current[city.id], warning: error.message }
          : { error: error.message },
      }));
    } finally {
      setRefreshingCityIds((current) => {
        const next = { ...current };
        delete next[city.id];
        return next;
      });
    }
  }, [weatherLang]);

  useEffect(() => {
    loadWeather();
    return () => {
      loadGenerationRef.current += 1;
    };
  }, [loadWeather]);

  return {
    weatherByCity,
    forecastByCity,
    isLoading,
    refreshingCityIds,
    refreshWeather: loadWeather,
    refreshCityWeather,
  };
}

export { prefetchWeatherBatch };
