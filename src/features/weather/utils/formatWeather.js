import {
  TEMPERATURE_UNIT,
  convertTemperatureFromCelsius,
  normalizeTemperatureUnit,
  temperatureUnitSuffix,
} from '@/constants/temperature-unit';

export function formatWindDirection(degrees) {
  if (degrees == null) return null;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
}

export function formatTemperature(value, unit = TEMPERATURE_UNIT.CELSIUS) {
  if (value == null) return '—';

  const normalized = normalizeTemperatureUnit(unit);
  const display = convertTemperatureFromCelsius(value, normalized);

  return `${Math.round(display)}${temperatureUnitSuffix(normalized)}`;
}

export function formatConditionLabel(description) {
  if (!description) return 'Unknown';
  return description.charAt(0).toUpperCase() + description.slice(1);
}
