'use client';

import { useCallback, useRef, useState } from 'react';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { buildCityId } from '@/lib/utils';
import {
  prefetchWeatherBatch,
  readLocalWeatherCache,
} from '@/features/weather/utils/weather-cache';
import { buildSearchResultKey } from '@/features/cities/utils/city-search';

export function useSearchResultPreview() {
  const [previews, setPreviews] = useState({});
  const inflightRef = useRef(new Set());

  const loadPreview = useCallback(async (result) => {
    const key = buildSearchResultKey(result);
    const cityId = buildCityId(result.name, result.country, result.lat);

    const cached = readLocalWeatherCache(cityId, 'current');
    if (cached?.payload) {
      setPreviews((current) => ({
        ...current,
        [key]: { data: cached.payload, loading: false },
      }));
      return;
    }

    if (inflightRef.current.has(key)) {
      return;
    }

    inflightRef.current.add(key);
    setPreviews((current) => ({
      ...current,
      [key]: { ...(current[key] ?? {}), loading: true },
    }));

    try {
      const entry = await prefetchWeatherBatch({
        lat: result.lat,
        lon: result.lon,
        cityId,
        scopes: ['current'],
        trigger: WEATHER_CHECK_TRIGGERS.searchPreview,
      });
      const data = entry?.scopes?.current?.data ?? null;

      setPreviews((current) => ({
        ...current,
        [key]: {
          data,
          loading: false,
          error: data ? null : 'Unavailable',
        },
      }));
    } catch {
      setPreviews((current) => ({
        ...current,
        [key]: { loading: false, error: 'Unavailable' },
      }));
    } finally {
      inflightRef.current.delete(key);
    }
  }, []);

  return { previews, loadPreview };
}
