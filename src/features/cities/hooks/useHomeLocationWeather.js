'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocale } from 'next-intl';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { DASHBOARD_CURRENT_MAX_AGE_MS } from '@/constants/weather';
import { resolveOpenWeatherLang } from '@/i18n/locales';
import { buildCityId } from '@/lib/utils';
import { cacheMeetsMaxAge } from '@/lib/weather-cache-age';
import { useUserLocationProfile } from '@/features/cities/hooks/useUserLocationProfile';
import {
  saveConfirmedHomeLocation,
  writeUserLocationMeta,
} from '@/features/cities/utils/user-location-profile';
import {
  prefetchWeatherBatch,
  readLocalWeatherCache,
} from '@/features/weather/utils/weather-cache';

const HomeLocationWeatherContext = createContext(null);

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
  if (profile?.lat == null || profile?.lon == null) {
    return null;
  }

  // Coordinate-keyed so renaming the profile city does not fork L0 cache rows
  // or force a second OpenWeather batch for the same place.
  return `home:${Number(profile.lat).toFixed(4)},${Number(profile.lon).toFixed(4)}`;
}

function useHomeLocationWeatherState() {
  const locale = useLocale();
  const weatherLang = resolveOpenWeatherLang(locale);
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
  const loadedCoordsRef = useRef(null);

  const profileLat = profile?.lat ?? null;
  const profileLon = profile?.lon ?? null;
  const profileName = profile?.name ?? null;
  const profileCountry = profile?.country ?? null;
  const profileSource = profile?.source ?? null;
  const profileState = profile?.state ?? null;

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
          loadedCoordsRef.current = null;
        }
        return;
      }

      const coordsKey = `${Number(profileLat).toFixed(4)},${Number(profileLon).toFixed(4)}`;
      if (loadedCoordsRef.current !== coordsKey) {
        setIsLoading(true);
      }
      setError(null);

      const locationSnapshot = {
        name: profileName,
        country: profileCountry,
        state: profileState,
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
      const cacheFresh = Boolean(
        cached?.payload
        && cacheMeetsMaxAge(
          { meta: { fetchedAt: cached.fetchedAt } },
          DASHBOARD_CURRENT_MAX_AGE_MS,
        ),
      );

      if (cached?.payload && !cancelled) {
        setCity(buildCityCandidate(locationSnapshot, cached.payload) ?? provisionalCity);
        setWeather(cached.payload);
      }

      // Local-first: reuse fresh L0 and skip OpenWeather when coords already warm.
      if (cacheFresh && loadedCoordsRef.current === coordsKey && !cancelled) {
        setIsLoading(false);
        return;
      }

      if (cacheFresh && !cancelled) {
        loadedCoordsRef.current = coordsKey;
        setIsLoading(false);
        return;
      }

      try {
        const entry = await prefetchWeatherBatch({
          lat: profileLat,
          lon: profileLon,
          cityId: cacheId,
          scopes: ['current'],
          trigger: WEATHER_CHECK_TRIGGERS.dashboardLoad,
          lang: weatherLang,
        });
        const data = entry?.scopes?.current?.data ?? null;

        if (cancelled) {
          return;
        }

        if (!data) {
          if (cached?.payload) {
            loadedCoordsRef.current = coordsKey;
            setIsLoading(false);
            return;
          }
          setError('Unable to load local weather');
          setIsLoading(false);
          return;
        }

        setCity(buildCityCandidate(locationSnapshot, data));
        setWeather(data);
        loadedCoordsRef.current = coordsKey;

        const syncKey = `${coordsKey}:${data.city ?? ''}`;
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
          if (cached?.payload) {
            loadedCoordsRef.current = coordsKey;
          } else {
            setError(loadError.message ?? 'Unable to load local weather');
          }
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
    profileState,
    refreshProfile,
    weatherLang,
  ]);

  const confirmHomeLocation = useCallback((selectedCity) => {
    saveConfirmedHomeLocation(selectedCity);
    refreshProfile();
    setWeather(null);
    setError(null);
    setIsLoading(true);
    loadedCoordsRef.current = null;
    setCity({
      id: buildCityId(selectedCity.name, selectedCity.country, selectedCity.lat),
      name: selectedCity.name,
      country: selectedCity.country,
      state: selectedCity.state ?? null,
      lat: selectedCity.lat,
      lon: selectedCity.lon,
    });
  }, [refreshProfile]);

  return useMemo(() => ({
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
  }), [
    profile,
    displayLabel,
    sourceLabel,
    city,
    weather,
    isLocationLoading,
    isLoading,
    error,
    profileLat,
    profileLon,
    profileSource,
    confirmHomeLocation,
    refreshProfile,
  ]);
}

export function HomeLocationWeatherProvider({ children }) {
  const value = useHomeLocationWeatherState();
  return (
    <HomeLocationWeatherContext.Provider value={value}>
      {children}
    </HomeLocationWeatherContext.Provider>
  );
}

export function useHomeLocationWeather() {
  const context = useContext(HomeLocationWeatherContext);
  if (!context) {
    throw new Error('useHomeLocationWeather requires HomeLocationWeatherProvider');
  }
  return context;
}
