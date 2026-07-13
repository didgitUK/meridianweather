import { describe, expect, it } from 'vitest';
import {
  getWeatherCategory,
  isRainAlertWeather,
  isSnowAlertWeather,
  isStormAlertWeather,
  WEATHER_CATEGORY,
} from './openweather-conditions';

describe('openweather-conditions', () => {
  it('maps clear and cloud cover IDs', () => {
    expect(getWeatherCategory(800)).toBe(WEATHER_CATEGORY.CLEAR);
    expect(getWeatherCategory(801)).toBe(WEATHER_CATEGORY.CLOUDS);
    expect(getWeatherCategory(804)).toBe(WEATHER_CATEGORY.CLOUDS);
  });

  it('maps precipitation and storm ID ranges', () => {
    expect(getWeatherCategory(300)).toBe(WEATHER_CATEGORY.DRIZZLE);
    expect(getWeatherCategory(500)).toBe(WEATHER_CATEGORY.RAIN);
    expect(getWeatherCategory(511)).toBe(WEATHER_CATEGORY.RAIN);
    expect(getWeatherCategory(200)).toBe(WEATHER_CATEGORY.THUNDERSTORM);
    expect(getWeatherCategory(600)).toBe(WEATHER_CATEGORY.SNOW);
    expect(getWeatherCategory(701)).toBe(WEATHER_CATEGORY.ATMOSPHERIC);
    expect(getWeatherCategory(900)).toBe(WEATHER_CATEGORY.EXTREME);
  });

  it('returns unknown for invalid IDs', () => {
    expect(getWeatherCategory(null)).toBe(WEATHER_CATEGORY.UNKNOWN);
    expect(getWeatherCategory(999)).toBe(WEATHER_CATEGORY.UNKNOWN);
  });

  it('detects rain alerts from drizzle and rain IDs', () => {
    expect(isRainAlertWeather(300)).toBe(true);
    expect(isRainAlertWeather(500)).toBe(true);
    expect(isRainAlertWeather(800)).toBe(false);
  });

  it('detects storm alerts from thunderstorm IDs', () => {
    expect(isStormAlertWeather(211)).toBe(true);
    expect(isStormAlertWeather(500)).toBe(false);
  });

  it('detects snow alerts from snow IDs', () => {
    expect(isSnowAlertWeather(601)).toBe(true);
    expect(isSnowAlertWeather(500)).toBe(false);
  });

  it('falls back to icon prefix when weatherId is unknown', () => {
    expect(isRainAlertWeather(null, '10d')).toBe(true);
    expect(isRainAlertWeather(null, '09n')).toBe(true);
    expect(isStormAlertWeather(null, '11d')).toBe(true);
    expect(isSnowAlertWeather(null, '13n')).toBe(true);
    expect(isRainAlertWeather(null, '01d')).toBe(false);
  });
});
