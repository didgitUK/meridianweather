import { describe, expect, it } from 'vitest';
import {
  buildCityDetailMetricTrends,
  findHourlyComparisonPoint,
  METRIC_TREND,
  resolveMetricTrend,
} from './metric-trend';

describe('metric-trend', () => {
  it('resolves up, down, and flat trends with thresholds', () => {
    expect(resolveMetricTrend(12, 10, 0.4)).toBe(METRIC_TREND.UP);
    expect(resolveMetricTrend(10, 12, 0.4)).toBe(METRIC_TREND.DOWN);
    expect(resolveMetricTrend(10.2, 10, 0.4)).toBe(METRIC_TREND.FLAT);
    expect(resolveMetricTrend(null, 10)).toBeNull();
  });

  it('finds the hourly point closest to one hour earlier', () => {
    const points = [
      { dt: 1_700_000_000, temp: 10 },
      { dt: 1_700_003_400, temp: 11 },
      { dt: 1_700_006_800, temp: 12 },
    ];

    expect(findHourlyComparisonPoint(points, 1_700_007_200)?.temp).toBe(11);
    expect(findHourlyComparisonPoint(points, 1_700_007_200, 10_000)).toBeNull();
  });

  it('builds metric trends from current weather and hourly history', () => {
    const current = {
      updatedAt: 1_700_007_200,
      temperature: 14,
      feelsLike: 13,
      humidity: 60,
      pressure: 1018,
      dewPoint: 8,
      uvi: 4,
      clouds: 20,
      visibility: 10_000,
      windSpeedKmh: 12,
      windGustKmh: 16,
      rain1h: 0.2,
      snow1h: 0,
    };
    const hourlyPoints = [
      {
        dt: 1_700_003_600,
        temp: 12,
        feelsLike: 11,
        humidity: 55,
        pressure: 1016,
        dewPoint: 7,
        uvi: 3.5,
        clouds: 15,
        visibility: 9_500,
        windSpeedKmh: 9,
        windGustKmh: 12.6,
        rain1h: 0.1,
        snow1h: 0,
      },
    ];

    const trends = buildCityDetailMetricTrends(current, hourlyPoints);

    expect(trends.temperature).toBe(METRIC_TREND.UP);
    expect(trends.humidity).toBe(METRIC_TREND.UP);
    expect(trends.pressure).toBe(METRIC_TREND.UP);
    expect(trends.precipitation).toBe(METRIC_TREND.UP);
    expect(trends.snow1h).toBe(METRIC_TREND.FLAT);
  });
});
