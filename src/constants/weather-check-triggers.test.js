import { describe, expect, it } from 'vitest';
import {
  WEATHER_CHECK_TRIGGERS,
  labelWeatherCheckTrigger,
  mapCacheLayerToOutcome,
  normalizeWeatherCheckTrigger,
} from '@/constants/weather-check-triggers';

describe('weather-check-triggers', () => {
  it('whitelists known triggers and falls back to unknown', () => {
    expect(normalizeWeatherCheckTrigger('dashboard_load')).toBe(
      WEATHER_CHECK_TRIGGERS.dashboardLoad,
    );
    expect(normalizeWeatherCheckTrigger('not-a-real-trigger')).toBe(
      WEATHER_CHECK_TRIGGERS.unknown,
    );
    expect(normalizeWeatherCheckTrigger(null)).toBe(WEATHER_CHECK_TRIGGERS.unknown);
  });

  it('maps cache layers to check outcomes', () => {
    expect(mapCacheLayerToOutcome('memory')).toBe('memory');
    expect(mapCacheLayerToOutcome('database')).toBe('sqlite');
    expect(mapCacheLayerToOutcome('upstream')).toBe('upstream');
  });

  it('labels triggers for admin UI', () => {
    expect(labelWeatherCheckTrigger(WEATHER_CHECK_TRIGGERS.dashboardRefresh)).toBe(
      'Dashboard refresh',
    );
  });
});
