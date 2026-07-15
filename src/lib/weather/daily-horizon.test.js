import { describe, expect, it, vi } from 'vitest';
import {
  enumerateForwardDateKeys,
  mergeDailyTimelinePoints,
  normalizeDaySummaryPoint,
  synthesizeExtendedDailyPoints,
  TARGET_DAILY_FORECAST_DAYS,
} from './daily-horizon';
import { extendDailyPayloadToHorizon } from './extend-daily-horizon';

describe('daily-horizon', () => {
  it('enumerates consecutive date keys', () => {
    expect(enumerateForwardDateKeys('2026-07-14', 3)).toEqual([
      '2026-07-14',
      '2026-07-15',
      '2026-07-16',
    ]);
  });

  it('merges extras without overwriting existing days', () => {
    const base = [{ dt: 1_720_915_200, tempMax: 20, description: 'Base' }];
    const extras = [
      { dt: 1_720_915_200, tempMax: 99, description: 'Ignored' },
      { dt: 1_721_001_600, tempMax: 22, description: 'Extra' },
    ];

    const merged = mergeDailyTimelinePoints(base, extras, 0);
    expect(merged).toHaveLength(2);
    expect(merged[0].description).toBe('Base');
    expect(merged[1].description).toBe('Extra');
  });

  it('normalizes day_summary payloads into timeline points', () => {
    const point = normalizeDaySummaryPoint(
      {
        date: '2026-07-20',
        temperature: { min: 10, max: 21, afternoon: 18 },
        cloud_cover: { afternoon: 10 },
        precipitation: { total: 0 },
        humidity: { afternoon: 40 },
        pressure: { afternoon: 1012 },
        wind: { max: { speed: 5, direction: 90 } },
      },
      0,
    );

    expect(point.tempMin).toBe(10);
    expect(point.tempMax).toBe(21);
    expect(point.condition).toBe('Clear');
    expect(point.icon).toBe('01d');
    expect(point.windSpeedKmh).toBe(18);
  });

  it('synthesizes estimated days when OpenWeather connectors stay short', () => {
    const base = Array.from({ length: 6 }, (_, index) => ({
      dt: 1_720_915_200 + index * 86_400,
      tempMax: 18 + index * 0.2,
      tempMin: 10 + index * 0.1,
      pop: 0.1,
      icon: '03d',
      description: 'Clouds',
    }));

    const points = synthesizeExtendedDailyPoints(base, 0, 10);
    expect(points).toHaveLength(10);
    expect(points.filter((point) => point.isExtended)).toHaveLength(4);
  });
});

describe('extendDailyPayloadToHorizon', () => {
  it('pads short daily payloads with day_summary when daily16 is unavailable', async () => {
    const basePoints = Array.from({ length: 8 }, (_, index) => ({
      dt: 1_720_915_200 + index * 86_400,
      tempMax: 20 + index,
      tempMin: 10 + index,
      description: `Day ${index}`,
    }));

    const payload = await extendDailyPayloadToHorizon(
      {
        scope: 'daily',
        timezoneOffset: 0,
        points: basePoints,
        source: 'onecall_3_daily',
      },
      51.5,
      -0.1,
      {},
      {
        fetchForecastDaily16Data: vi.fn(async () => null),
        fetchDaySummary: vi.fn(async (_lat, _lon, date) => ({
          date,
          temperature: { min: 9, max: 19, afternoon: 15 },
          cloud_cover: { afternoon: 40 },
          precipitation: { total: 0 },
          humidity: { afternoon: 50 },
          pressure: { afternoon: 1010 },
          wind: { max: { speed: 4, direction: 180 } },
        })),
      },
    );

    expect(payload.points).toHaveLength(TARGET_DAILY_FORECAST_DAYS);
    expect(payload.source).toContain('+horizon');
  });
});
