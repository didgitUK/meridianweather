'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { buildCityId } from '@/lib/utils';
import { useUserLocationProfile } from '@/features/cities/hooks/useUserLocationProfile';
import {
  saveConfirmedHomeLocation,
  writeUserLocationMeta,
} from '@/features/cities/utils/user-location-profile';
import {
  prefetchWeatherBatch,
  readLocalWeatherCache,
} from '@/features/weather/utils/weather-cache';

function buildCityCandidate(profile, weather) {
  const name = profile?.name ?? weather?.city ?? null;
  const country = profile?.country ?? weather?.country ?? null;
  const lat = profile?.lat ?? null;
  const lon = profile?.lon ?? null;

  if (!name || !country || lat == null || lon == null) {
    return null;
  }

  return {
    id: buildCityId(name, country, lat),
    name,
    country,
    state: profile?.state ?? weather?.state ?? null,
    lat,
    lon,
  };
}

function homeCacheCityId(profile) {
  if (profile?.name && profile?.country && profile?.lat != null) {
    return buildCityId(profile.name, profile.country, profile.lat);
  }

  if (profile?.lat == null || profile?.lon == null) {
    return null;
  }

  return `home:${Number(profile.lat).toFixed(4)},${Number(profile.lon).toFixed(4)}`;
}

export function useHomeLocationWeather() {
  const {
    profile,
    displayLabel,
    sourceLabel,
    isLoading: isLocationLoading,
    refreshProfile,
  } = useUserLocationProfile();

  const [city, setCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const metaSyncedRef = useRef(null);

  const profileLat = profile?.lat ?? null;
  const profileLon = profile?.lon ?? null;
  const profileName = profile?.name ?? null;
  const profileCountry = profile?.country ?? null;
  const profileSource = profile?.source ?? null;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (isLocationLoading) {
        return;
      }

      if (profileLat == null || profileLon == null) {
        if (!cancelled) {
          setCity(null);
          setWeather(null);
          setError(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      const locationSnapshot = {
        name: profileName,
        country: profileCountry,
        state: profile?.state ?? null,
        lat: profileLat,
        lon: profileLon,
        source: profileSource,
      };

      const provisionalCity = buildCityCandidate(locationSnapshot, null);
      if (provisionalCity && !cancelled) {
        setCity(provisionalCity);
      }

      const cacheId = homeCacheCityId(locationSnapshot);
      const cached = cacheId ? readLocalWeatherCache(cacheId, 'current') : null;

      if (cached?.payload && !cancelled) {
        setCity(buildCityCandidate(locationSnapshot, cached.payload) ?? provisionalCity);
        setWeather(cached.payload);
      }

      try {
        const entry = await prefetchWeatherBatch({
          lat: profileLat,
          lon: profileLon,
          cityId: cacheId,
          scopes: ['current'],
          trigger: WEATHER_CHECK_TRIGGERS.dashboardLoad,
        });
        const data = entry?.scopes?.current?.data ?? null;

        if (cancelled) {
          return;
        }

        if (!data) {
          setError('Unable to load local weather');
          setIsLoading(false);
          return;
        }

        setCity(buildCityCandidate(locationSnapshot, data));
        setWeather(data);

        const syncKey = `${profileLat},${profileLon}:${data.city ?? ''}`;
        if (
          data.city
          && profileSource !== 'confirmed'
          && (!profileName || profileName !== data.city)
          && metaSyncedRef.current !== syncKey
        ) {
          metaSyncedRef.current = syncKey;
          writeUserLocationMeta({
            name: data.city,
            country: data.country ?? profileCountry ?? null,
            label: [data.city, data.country ?? profileCountry].filter(Boolean).join(', '),
          });
          refreshProfile();
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message ?? 'Unable to load local weather');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    isLocationLoading,
    profileLat,
    profileLon,
    profileName,
    profileCountry,
    profileSource,
    profile?.state,
    refreshProfile,
  ]);

  const confirmHomeLocation = useCallback((selectedCity) => {
    saveConfirmedHomeLocation(selectedCity);
    refreshProfile();
    setWeather(null);
    setError(null);
    setIsLoading(true);
    setCity({
      id: buildCityId(selectedCity.name, selectedCity.country, selectedCity.lat),
      name: selectedCity.name,
      country: selectedCity.country,
      state: selectedCity.state ?? null,
      lat: selectedCity.lat,
      lon: selectedCity.lon,
    });
  }, [refreshProfile]);

  return {
    profile,
    displayLabel,
    sourceLabel,
    city,
    weather,
    isLoading: isLocationLoading || isLoading,
    error,
    hasCoordinates: profileLat != null && profileLon != null,
    isConfirmed: profileSource === 'confirmed',
    confirmHomeLocation,
    refreshProfile,
  };
}
