export const TEMPERATURE_UNIT = {
  CELSIUS: 'celsius',
  FAHRENHEIT: 'fahrenheit',
};

export function normalizeTemperatureUnit(unit) {
  return unit === TEMPERATURE_UNIT.FAHRENHEIT
    ? TEMPERATURE_UNIT.FAHRENHEIT
    : TEMPERATURE_UNIT.CELSIUS;
}

export function temperatureUnitSuffix(unit = TEMPERATURE_UNIT.CELSIUS) {
  return normalizeTemperatureUnit(unit) === TEMPERATURE_UNIT.FAHRENHEIT ? '°F' : '°C';
}

export function celsiusToFahrenheit(value) {
  return (value * 9) / 5 + 32;
}

export function convertTemperatureFromCelsius(value, unit = TEMPERATURE_UNIT.CELSIUS) {
  if (value == null) {
    return null;
  }

  const normalized = normalizeTemperatureUnit(unit);

  if (normalized === TEMPERATURE_UNIT.FAHRENHEIT) {
    return celsiusToFahrenheit(value);
  }

  return value;
}

/** Map a UI locale to the usual temperature unit for that region. */
export function temperatureUnitForLocale(locale) {
  if (locale === 'en') {
    return TEMPERATURE_UNIT.FAHRENHEIT;
  }

  return TEMPERATURE_UNIT.CELSIUS;
}
