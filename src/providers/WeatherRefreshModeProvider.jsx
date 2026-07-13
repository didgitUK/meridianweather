'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import {
  DEFAULT_WEATHER_REFRESH_MODE,
  WEATHER_REFRESH_MODE,
  normalizeWeatherRefreshMode,
} from '@/constants/weather-refresh';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { useLocalStorageValue, writeLocalStorageValue } from '@/hooks/use-browser-storage';

const WeatherRefreshModeContext = createContext({
  mode: DEFAULT_WEATHER_REFRESH_MODE,
  isManual: true,
  setMode: () => {},
});

export function WeatherRefreshModeProvider({ children }) {
  const raw = useLocalStorageValue(STORAGE_KEYS.weatherRefreshMode, DEFAULT_WEATHER_REFRESH_MODE);
  const mode = normalizeWeatherRefreshMode(raw);

  const setMode = useCallback((nextMode) => {
    writeLocalStorageValue(
      STORAGE_KEYS.weatherRefreshMode,
      normalizeWeatherRefreshMode(nextMode),
    );
  }, []);

  const value = useMemo(
    () => ({
      mode,
      isManual: mode === WEATHER_REFRESH_MODE.MANUAL,
      setMode,
    }),
    [mode, setMode],
  );

  return (
    <WeatherRefreshModeContext.Provider value={value}>
      {children}
    </WeatherRefreshModeContext.Provider>
  );
}

export function useWeatherRefreshMode() {
  return useContext(WeatherRefreshModeContext);
}
