'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { SCOPE_TTL } from '@/constants/weather';
import { resolveOpenWeatherLang } from '@/i18n/locales';
import { cacheMeetsMaxAge } from '@/lib/weather-cache-age';
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

const DETAIL_SCOPES = ['current', 'hourly', 'daily'];

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

function scopeIsFresh(entry, scope, maxAgeOverrideMs) {
  if (!entry?.data) {
    return false;
  }

  const maxAge = maxAgeOverrideMs ?? SCOPE_TTL[scope]?.fresh ?? SCOPE_TTL.current.fresh;
  return cacheMeetsMaxAge(
    { meta: { fetchedAt: entry.meta?.fetchedAt ?? null } },
    maxAge,
  );
}

export function useCityWeather(city, isHydrated, initialScopes = null, options = {}) {
  const locale = useLocale();
  const weatherLang = resolveOpenWeatherLang(locale);
  const { isManual } = useWeatherRefreshMode();
  const trigger = options.trigger ?? WEATHER_CHECK_TRIGGERS.cityDetail;
  const defaultMaxAgeMs = options.maxAgeMs;
  const [scopes, setScopes] = useState(() => buildInitialScopes(initialScopes));
  const [isLoading, setIsLoading] = useState(!initialScopes?.current?.data);
  const [error, setError] = useState(null);
  const [loadProgress, setLoadProgress] = useState(
    initialScopes?.current?.data ? 1 : 0.12,
  );
  const [loadStage, setLoadStage] = useState(
    initialScopes?.current?.data ? 'preparingForecast' : 'loadingLocation',
  );
  const initialScopesRef = useRef(initialScopes);
  const loadGenerationRef = useRef(0);

  useEffect(() => {
    initialScopesRef.current = initialScopes;
  }, [initialScopes]);

  const cityId = city?.id ?? null;
  const cityLat = city?.lat ?? null;
  const cityLon = city?.lon ?? null;
  const cityName = city?.name ?? null;

  const load = useCallback(async ({ force = false } = {}) => {
    if (!isHydrated || cityId == null || cityLat == null || cityLon == null) {
      return;
    }

    const generation = ++loadGenerationRef.current;

    setLoadStage(cityName ? 'loadingDataFor' : 'loadingLocation');
    setLoadProgress(0.22);

    const initial = buildInitialScopes(initialScopesRef.current);
    for (const scope of DETAIL_SCOPES) {
      if (initial[scope]) {
        continue;
      }

      const cached = readLocalWeatherCache(cityId, scope);
      if (cached?.payload) {
        initial[scope] = {
          data: cached.payload,
          meta: { fetchedAt: cached.fetchedAt, cacheLayer: 'client' },
        };
      }
    }

    if (generation !== loadGenerationRef.current) {
      return;
    }

    setScopes(initial);
    setError(null);

    const hasCurrentCache = Boolean(initial.current?.data);
    if (hasCurrentCache) {
      setLoadStage('checkingAlerts');
      setLoadProgress(0.42);
    }

    const allCoreFresh = ['current', 'hourly', 'daily'].every(
      (scope) => scopeIsFresh(initial[scope], scope, defaultMaxAgeMs),
    );
    const canSkipNetwork = !force && (
      (isManual && hasCurrentCache)
      || allCoreFresh
    );

    if (canSkipNetwork) {
      setLoadStage('preparingForecast');
      setLoadProgress(1);
      setIsLoading(false);
      return;
    }

    const missingOrStale = force
      ? DETAIL_SCOPES
      : DETAIL_SCOPES.filter((scope) => !scopeIsFresh(initial[scope], scope, defaultMaxAgeMs));

    setIsLoading(true);
    setLoadStage('formulatingCharts');
    setLoadProgress((prev) => Math.max(prev, 0.58));

    try {
      const entry = await loadWeatherBatchForCity({
        lat: cityLat,
        lon: cityLon,
        scopes: missingOrStale.length > 0 ? missingOrStale : DETAIL_SCOPES,
        maxAgeMs: force ? FORCE_REFRESH_MAX_AGE_MS : defaultMaxAgeMs,
        trigger,
        lang: weatherLang,
      });

      if (generation !== loadGenerationRef.current) {
        return;
      }

      setLoadStage('preparingForecast');
      setLoadProgress(0.9);

      persistBatchScopes(entry, DETAIL_SCOPES, (scope, payload) => {
        writeLocalWeatherCache(cityId, scope, payload);
      });

      setScopes(mergeBatchScopes(entry, DETAIL_SCOPES, { target: initial }));
      setLoadProgress(1);
    } catch (loadError) {
      if (generation !== loadGenerationRef.current) {
        return;
      }
      setError(loadError.message);
      setLoadProgress(1);
    } finally {
      if (generation === loadGenerationRef.current) {
        setIsLoading(false);
      }
    }
  }, [cityId, cityLat, cityLon, cityName, defaultMaxAgeMs, isHydrated, isManual, trigger, weatherLang]);

  useEffect(() => {
    void load();

    return () => {
      loadGenerationRef.current += 1;
    };
  }, [load]);

  const refresh = useCallback(() => load({ force: true }), [load]);

  return {
    scopes,
    isLoading,
    error,
    refresh,
    loadProgress,
    loadStage,
  };
}

export async function prefetchCityDetail(city, lang) {
  if (!city) return;
  return prefetchWeatherBatch({
    lat: city.lat,
    lon: city.lon,
    cityId: city.id,
    scopes: DETAIL_SCOPES,
    trigger: WEATHER_CHECK_TRIGGERS.cityDetail,
    lang,
  });
}
