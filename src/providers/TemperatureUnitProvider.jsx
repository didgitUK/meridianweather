'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useLocale } from 'next-intl';
import {
  TEMPERATURE_UNIT,
  normalizeTemperatureUnit,
} from '@/constants/temperature-unit';
import { getDefaultTemperatureUnitForLocale } from '@/i18n/locales';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { formatTempRange } from '@/features/weather/utils/forecast-formatters';
import { formatTemperature } from '@/features/weather/utils/formatWeather';
import { useLocalStorageValue, writeLocalStorageValue } from '@/hooks/use-browser-storage';

const TemperatureUnitContext = createContext({
  unit: TEMPERATURE_UNIT.CELSIUS,
  isFahrenheit: false,
  setUnit: () => {},
  toggleUnit: () => {},
  syncUnitFromLocale: () => {},
  formatTemp: formatTemperature,
  formatTempRange,
});

export function TemperatureUnitProvider({ children }) {
  const locale = useLocale();
  const raw = useLocalStorageValue(STORAGE_KEYS.temperatureUnit, '');
  const seededLocaleRef = useRef(null);

  const unit = raw
    ? normalizeTemperatureUnit(raw)
    : normalizeTemperatureUnit(getDefaultTemperatureUnitForLocale(locale));

  const setUnit = useCallback((nextUnit) => {
    writeLocalStorageValue(STORAGE_KEYS.temperatureUnit, normalizeTemperatureUnit(nextUnit));
  }, []);

  const syncUnitFromLocale = useCallback((nextLocale) => {
    setUnit(getDefaultTemperatureUnitForLocale(nextLocale));
  }, [setUnit]);

  const toggleUnit = useCallback(() => {
    setUnit(unit === TEMPERATURE_UNIT.CELSIUS ? TEMPERATURE_UNIT.FAHRENHEIT : TEMPERATURE_UNIT.CELSIUS);
  }, [setUnit, unit]);

  useEffect(() => {
    if (raw) {
      seededLocaleRef.current = locale;
      return;
    }

    if (seededLocaleRef.current === locale) {
      return;
    }

    seededLocaleRef.current = locale;
    writeLocalStorageValue(
      STORAGE_KEYS.temperatureUnit,
      getDefaultTemperatureUnitForLocale(locale),
    );
  }, [locale, raw]);

  const value = useMemo(
    () => ({
      unit,
      isFahrenheit: unit === TEMPERATURE_UNIT.FAHRENHEIT,
      setUnit,
      toggleUnit,
      syncUnitFromLocale,
      formatTemp: (value) => formatTemperature(value, unit),
      formatTempRange: (min, max) => formatTempRange(min, max, unit),
    }),
    [setUnit, syncUnitFromLocale, toggleUnit, unit],
  );

  return (
    <TemperatureUnitContext.Provider value={value}>
      {children}
    </TemperatureUnitContext.Provider>
  );
}

export function useTemperatureUnit() {
  return useContext(TemperatureUnitContext);
}
