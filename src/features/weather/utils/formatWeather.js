import {
  TEMPERATURE_UNIT,
  convertTemperatureFromCelsius,
  normalizeTemperatureUnit,
} from '@/constants/temperature-unit';

export function formatWindDirection(degrees) {
  if (degrees == null) return null;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
}

export function formatTemperature(value, unit = TEMPERATURE_UNIT.CELSIUS) {
  if (value == null) return '—';

  const display = convertTemperatureFromCelsius(value, normalizeTemperatureUnit(unit));

  return `${Math.round(display)}°`;
}

export function formatConditionLabel(description) {
  if (!description) return 'Unknown';
  return description.charAt(0).toUpperCase() + description.slice(1);
}
