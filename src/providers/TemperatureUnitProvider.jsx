'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { TEMPERATURE_UNIT, normalizeTemperatureUnit } from '@/constants/temperature-unit';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { formatTempRange } from '@/features/weather/utils/forecast-formatters';
import { formatTemperature } from '@/features/weather/utils/formatWeather';
import { useLocalStorageValue, writeLocalStorageValue } from '@/hooks/use-browser-storage';

const TemperatureUnitContext = createContext({
  unit: TEMPERATURE_UNIT.CELSIUS,
  isFahrenheit: false,
  setUnit: () => {},
  toggleUnit: () => {},
  formatTemp: formatTemperature,
  formatTempRange,
});

export function TemperatureUnitProvider({ children }) {
  const raw = useLocalStorageValue(STORAGE_KEYS.temperatureUnit, TEMPERATURE_UNIT.CELSIUS);
  const unit = normalizeTemperatureUnit(raw);

  const setUnit = useCallback((nextUnit) => {
    writeLocalStorageValue(STORAGE_KEYS.temperatureUnit, normalizeTemperatureUnit(nextUnit));
  }, []);

  const toggleUnit = useCallback(() => {
    setUnit(unit === TEMPERATURE_UNIT.CELSIUS ? TEMPERATURE_UNIT.FAHRENHEIT : TEMPERATURE_UNIT.CELSIUS);
  }, [setUnit, unit]);

  const value = useMemo(
    () => ({
      unit,
      isFahrenheit: unit === TEMPERATURE_UNIT.FAHRENHEIT,
      setUnit,
      toggleUnit,
      formatTemp: (value) => formatTemperature(value, unit),
      formatTempRange: (min, max) => formatTempRange(min, max, unit),
    }),
    [setUnit, toggleUnit, unit],
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
