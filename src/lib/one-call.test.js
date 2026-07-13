import { describe, expect, it } from 'vitest';
import { mergeUviIntoTimelinePoints, normalizeWeatherResponse } from '@/lib/one-call';

describe('one-call normalization', () => {
  it('maps current one-call fields', () => {
    const payload = normalizeWeatherResponse({
      scope: 'current',
      source: 'onecall_current',
      lat: 51.5,
      lon: -0.1,
      data: {
        timezone: 'Europe/London',
        timezone_offset: 3600,
        data: [
          {
            dt: 1_700_000_000,
            sunrise: 1_699_990_000,
            sunset: 1_700_050_000,
            temp: 12,
            feels_like: 11,
            pressure: 1018,
            humidity: 72,
            dew_point: 8,
            uvi: 2.4,
            clouds: 40,
            visibility: 10000,
            wind_speed: 3.5,
            wind_deg: 200,
            wind_gust: 6.2,
            rain: { '1h': 0.4 },
            snow: { '1h': 0 },
            weather: [{ id: 500, main: 'Rain', description: 'light rain', icon: '10d' }],
            alerts: ['alert-1'],
          },
        ],
      },
    });

    expect(payload.weatherId).toBe(500);
    expect(payload.condition).toBe('Rain');
    expect(payload.timezoneOffset).toBe(3600);
    expect(payload.rain1h).toBe(0.4);
    expect(payload.windGustKmh).toBe(22.3);
    expect(payload.alertIds).toEqual(['alert-1']);
  });

  it('maps daily timeline fields', () => {
    const payload = normalizeWeatherResponse({
      scope: 'daily',
      source: 'onecall_daily',
      lat: 51.5,
      lon: -0.1,
      data: {
        timezone: 'Europe/London',
        timezone_offset: 3600,
        data: [
          {
            dt: 1_700_000_000,
            moonrise: 1_700_010_000,
            moonset: 1_700_020_000,
            moon_phase: 0.42,
            summary: 'partly cloudy',
            temp: { day: 14, min: 9, max: 16, night: 10, eve: 13, morn: 8 },
            feels_like: { day: 13, night: 9, eve: 12, morn: 7 },
            pop: 0.2,
            uvi: 4.1,
            wind_speed: 4,
            wind_deg: 180,
            wind_gust: 8,
            weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }],
          },
        ],
      },
    });

    expect(payload.points[0].moonPhase).toBe(0.42);
    expect(payload.points[0].summary).toBe('Partly cloudy');
    expect(payload.points[0].tempMin).toBe(9);
    expect(payload.points[0].feelsLikeDay).toBe(13);
  });

  it('maps daily timeline fields from one-call 3.0', () => {
    const payload = normalizeWeatherResponse({
      scope: 'daily',
      source: 'onecall_3_timeline',
      lat: 51.5,
      lon: -0.1,
      data: {
        timezone: 'Europe/London',
        timezone_offset: 3600,
        daily: [
          {
            dt: 1_700_000_000,
            temp: { day: 14, min: 9, max: 16, night: 10, eve: 13, morn: 8 },
            weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }],
          },
        ],
      },
    });

    expect(payload.points).toHaveLength(1);
    expect(payload.points[0].tempMax).toBe(16);
    expect(payload.source).toBe('onecall_3_daily');
  });

  it('aggregates 2.5 forecast list into daily points', () => {
    const payload = normalizeWeatherResponse({
      scope: 'daily',
      source: 'forecast_2_5',
      lat: 51.5,
      lon: -0.1,
      data: {
        city: { timezone: 0 },
        list: [
          {
            dt: 1_700_000_000,
            main: { temp: 12, temp_min: 10, temp_max: 14 },
            pop: 0.1,
            weather: [{ id: 500, main: 'Rain', description: 'light rain', icon: '10d' }],
          },
          {
            dt: 1_700_003_600,
            main: { temp: 16, temp_min: 15, temp_max: 18 },
            pop: 0.4,
            weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }],
          },
        ],
      },
    });

    expect(payload.points).toHaveLength(1);
    expect(payload.points[0].tempMin).toBe(10);
    expect(payload.points[0].tempMax).toBe(18);
    expect(payload.points[0].pop).toBe(0.4);
    expect(payload.source).toBe('forecast_2_5_daily');
  });

  it('maps hourly forecast list items with precipitation defaults', () => {
    const payload = normalizeWeatherResponse({
      scope: 'hourly',
      source: 'forecast_2_5',
      lat: 51.5,
      lon: -0.1,
      data: {
        city: { timezone: 0 },
        list: [
          {
            dt: 1_700_000_000,
            main: { temp: 18, dew_point: 9 },
            pop: 0,
            weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
          },
        ],
      },
    });

    expect(payload.points[0].dewPoint).toBe(9);
    expect(payload.points[0].precipitation).toBe(0);
    expect(payload.source).toBe('forecast_2_5_hourly');
  });

  it('merges uvi forecast values onto timeline points', () => {
    const points = [{ dt: 1_700_000_000, uvi: null }];
    const merged = mergeUviIntoTimelinePoints(points, [{ date: 1_700_000_000, value: 6.4 }], 0);

    expect(merged[0].uvi).toBe(6.4);
  });
});
