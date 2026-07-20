import { describe, expect, it } from 'vitest';
import {
  WEATHER_CHECK_TRIGGERS,
  assertPublicWeatherApiTrigger,
  labelWeatherCheckTrigger,
  mapCacheLayerToOutcome,
  normalizeWeatherCheckTrigger,
  resolveSnapshotTtlClass,
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

  it('maps weather_place_seo to the seo snapshot ttl class', () => {
    expect(resolveSnapshotTtlClass(WEATHER_CHECK_TRIGGERS.weatherPlaceSeo)).toBe('seo');
    expect(resolveSnapshotTtlClass(WEATHER_CHECK_TRIGGERS.dashboardLoad)).toBe('default');
  });

  it('rejects weather_place_seo on the public weather API', () => {
    expect(() => assertPublicWeatherApiTrigger(WEATHER_CHECK_TRIGGERS.weatherPlaceSeo)).toThrow(
      /weather_place_seo/,
    );
    expect(() => assertPublicWeatherApiTrigger(WEATHER_CHECK_TRIGGERS.dashboardLoad)).not.toThrow();
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
    expect(labelWeatherCheckTrigger(WEATHER_CHECK_TRIGGERS.cronAlerts)).toBe('Cron alerts');
    expect(labelWeatherCheckTrigger(WEATHER_CHECK_TRIGGERS.legacyUntagged)).toBe(
      'Legacy (pre-tagging)',
    );
    expect(labelWeatherCheckTrigger(WEATHER_CHECK_TRIGGERS.adminConnectionCheck)).toBe(
      'Admin connection check',
    );
  });
});
