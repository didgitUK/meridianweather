import { describe, expect, it } from 'vitest';
import {
  getWeatherIconPath,
  openWeatherIconToMeteocon,
} from './weather-icon';

describe('weather-icon', () => {
  it('maps common OpenWeather codes to Meteocons icons', () => {
    expect(openWeatherIconToMeteocon('01d')).toBe('clear-day');
    expect(openWeatherIconToMeteocon('01n')).toBe('clear-night');
    expect(openWeatherIconToMeteocon('11d')).toBe('thunderstorms-day');
    expect(openWeatherIconToMeteocon('13n')).toBe('overcast-night-snow');
  });

  it('strips @2x suffix from legacy icon codes', () => {
    expect(openWeatherIconToMeteocon('02d@2x')).toBe('partly-cloudy-day');
  });

  it('falls back to cloudy for unknown codes', () => {
    expect(openWeatherIconToMeteocon('99z')).toBe('cloudy');
    expect(openWeatherIconToMeteocon(null)).toBe('cloudy');
  });

  it('builds local public asset paths', () => {
    expect(getWeatherIconPath('10d')).toBe('/weather-icons/partly-cloudy-day-rain.svg');
  });
});
