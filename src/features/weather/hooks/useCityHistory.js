'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchJson } from '@/lib/client/fetch-json';
import { getMonthHistoryQueryBounds } from '@/features/weather/utils/forecast-formatters';

const HISTORY_QUERY_LIMIT = 500;

export function useCityHistory(city, isHydrated, { forecastRange = 'week', todayKey = '' } = {}) {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [loadedKey, setLoadedKey] = useState('');

  const lat = city?.lat;
  const lon = city?.lon;
  const requestKey =
    lat != null && lon != null
      ? `${lat}:${lon}:${forecastRange}:${todayKey}:${refreshToken}`
      : '';
  const isLoading = Boolean(isHydrated && requestKey && loadedKey !== requestKey && error == null);

  useEffect(() => {
    if (!isHydrated || lat == null || lon == null) {
      return;
    }

    let cancelled = false;
    const monthBounds = forecastRange === 'month' ? getMonthHistoryQueryBounds(todayKey) : null;
    const from = monthBounds?.from ?? null;
    const to = monthBounds?.to ?? null;
    const limit = monthBounds?.limit ?? HISTORY_QUERY_LIMIT;
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      limit: String(limit),
    });

    if (from) {
      params.set('from', from);
    }

    if (to) {
      params.set('to', to);
    }

    (async () => {
      try {
        const payload = await fetchJson(`/api/weather/history?${params.toString()}`);

        if (!cancelled) {
          setHistory(payload);
          setError(null);
          setLoadedKey(requestKey);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
          setLoadedKey(requestKey);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [forecastRange, isHydrated, lat, lon, refreshToken, requestKey, todayKey]);

  const refresh = useCallback(() => {
    setRefreshToken((current) => current + 1);
  }, []);

  return {
    history,
    isLoading,
    error,
    refresh,
  };
}
