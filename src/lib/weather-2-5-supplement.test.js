import { describe, expect, it } from 'vitest';
import {
  findNearestForecastSlot,
  supplementLegacyCurrent,
} from '@/lib/weather-2-5-supplement';

describe('weather-2-5-supplement', () => {
  it('finds the nearest forecast slot to a timestamp', () => {
    const list = [
      { dt: 100, main: { dew_point: 8 } },
      { dt: 200, main: { dew_point: 10 } },
      { dt: 300, main: { dew_point: 12 } },
    ];

    expect(findNearestForecastSlot(list, 210)?.main?.dew_point).toBe(10);
  });

  it('fills missing legacy current fields from forecast and uvi lookups', async () => {
    const payload = await supplementLegacyCurrent(
      {
        scope: 'current',
        source: 'weather_2_5',
        updatedAt: 200,
        uvi: null,
        dewPoint: null,
        rain1h: null,
        precipitation: null,
      },
      51.5,
      -0.1,
      {
        fetchCurrentUvi: async () => 6.2,
        fetchForecast25Data: async () => ({
          city: { timezone: 3600 },
          list: [{ dt: 200, pop: 0, main: { dew_point: 14.5 } }],
        }),
      },
    );

    expect(payload.uvi).toBe(6.2);
    expect(payload.dewPoint).toBe(14.5);
    expect(payload.precipitation).toBe(0);
  });
});
