import { describe, expect, it, vi } from 'vitest';
import { toDateInputValue } from '@/features/weather/utils/forecast-formatters';
import {
  buildChartAxisLabels,
  buildDayChartPoints,
  buildForecastDayEntries,
  dedupeArchivedDailyPoints,
  densifyChartPoints,
  expandDayEntriesForCalendarMonth,
  filterDayEntriesByRange,
} from '@/features/weather/utils/forecast-explorer';
import { selectNextHours } from '@/features/weather/utils/forecast-chart-series';

describe('forecast explorer utils', () => {
  it('builds carousel days from daily forecast and stored history', () => {
    const todayNoonUtc = Math.floor(Date.UTC(2026, 6, 9, 12, 0, 0) / 1000);
    const yesterdayNoonUtc = Math.floor(Date.UTC(2026, 6, 8, 12, 0, 0) / 1000);
    const todayKey = toDateInputValue(todayNoonUtc, 'UTC');

    const entries = buildForecastDayEntries({
      timezone: 'UTC',
      todayKey,
      dailyPoints: [
        {
          dt: todayNoonUtc,
          icon: '01d',
          description: 'Sunny',
          tempMin: 14,
          tempMax: 25,
          pop: 0.1,
        },
      ],
      observations: [
        {
          updatedAt: yesterdayNoonUtc,
          temperature: 18,
          description: 'Cloudy',
          icon: '03d',
          observedAt: '2026-07-08T12:00:00.000Z',
        },
      ],
    });

    expect(entries).toHaveLength(2);
    expect(entries.some((entry) => entry.dayLabel === 'Today')).toBe(true);
    expect(entries.some((entry) => entry.source === 'history')).toBe(true);
  });

  it('merges archived daily forecasts and hourly aggregates into day entries', () => {
    const todayNoonUtc = Math.floor(Date.UTC(2026, 6, 9, 12, 0, 0) / 1000);
    const tomorrowNoonUtc = Math.floor(Date.UTC(2026, 6, 10, 12, 0, 0) / 1000);
    const todayKey = toDateInputValue(todayNoonUtc, 'UTC');

    const entries = buildForecastDayEntries({
      timezone: 'UTC',
      todayKey,
      dailyPoints: [],
      hourlyPoints: [
        {
          dt: todayNoonUtc,
          temp: 20,
          tempMin: 18,
          tempMax: 24,
          pop: 0.2,
          icon: '02d',
          description: 'Cloudy',
        },
      ],
      archivedDailyRows: [
        {
          issuedAt: '2026-07-08T12:00:00.000Z',
          point: {
            dt: tomorrowNoonUtc,
            tempMin: 15,
            tempMax: 28,
            pop: 0.5,
            icon: '10d',
            description: 'Rain',
          },
        },
        {
          issuedAt: '2026-07-09T12:00:00.000Z',
          point: {
            dt: tomorrowNoonUtc,
            tempMin: 16,
            tempMax: 29,
            pop: 0.4,
            icon: '09d',
            description: 'Showers',
          },
        },
      ],
      observations: [],
    });

    expect(entries).toHaveLength(2);
    expect(entries.find((entry) => entry.dateKey === '2026-07-09')?.source).toBe('hourly');
    expect(entries.find((entry) => entry.dateKey === '2026-07-10')?.source).toBe('archive');
    expect(entries.find((entry) => entry.dateKey === '2026-07-10')?.tempMax).toBe(29);
  });

  it('dedupes archived daily rows by latest issuedAt', () => {
    const dayUtc = Math.floor(Date.UTC(2026, 6, 10, 12, 0, 0) / 1000);

    const points = dedupeArchivedDailyPoints(
      [
        {
          issuedAt: '2026-07-08T12:00:00.000Z',
          point: { dt: dayUtc, tempMin: 10, tempMax: 20 },
        },
        {
          issuedAt: '2026-07-09T12:00:00.000Z',
          point: { dt: dayUtc, tempMin: 12, tempMax: 22 },
        },
      ],
      'UTC',
    );

    expect(points).toHaveLength(1);
    expect(points[0].tempMax).toBe(22);
  });

  it('densifies sparse hourly chart points to one-hour intervals', () => {
    const start = Math.floor(Date.UTC(2026, 6, 9, 6, 0, 0) / 1000);
    const end = Math.floor(Date.UTC(2026, 6, 9, 12, 0, 0) / 1000);

    const points = densifyChartPoints([
      { dt: start, temp: 10, pop: 0, windSpeedKmh: 5 },
      { dt: end, temp: 16, pop: 0.2, windSpeedKmh: 11 },
    ]);

    expect(points).toHaveLength(7);
    expect(points[3].temp).toBe(13);
  });

  it('selects the next twelve densified hours from now', () => {
    const nowMs = Date.UTC(2026, 6, 14, 12, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(nowMs);

    const nowSec = Math.floor(nowMs / 1000);
    const points = selectNextHours(
      [
        { dt: nowSec - 7200, temp: 10 },
        { dt: nowSec, temp: 12 },
        { dt: nowSec + 3 * 3600, temp: 15 },
        { dt: nowSec + 6 * 3600, temp: 18 },
        { dt: nowSec + 12 * 3600, temp: 14 },
        { dt: nowSec + 24 * 3600, temp: 11 },
      ],
      12,
    );

    expect(points).toHaveLength(12);
    expect(points[0].dt).toBe(nowSec);
    expect(points[11].dt).toBe(nowSec + 11 * 3600);

    vi.useRealTimers();
  });

  it('builds day chart points from live, archived, and stored observations', () => {
    const noonUtc = Math.floor(Date.UTC(2026, 6, 9, 12, 0, 0) / 1000);
    const threeHoursLater = noonUtc + 3 * 3600;

    const points = buildDayChartPoints({
      dateKey: '2026-07-09',
      timezone: 'UTC',
      hourlyPoints: [{ dt: noonUtc, temp: 20, pop: 0.1, windSpeedKmh: 8 }],
      archivedHourlyRows: [
        {
          issuedAt: '2026-07-09T08:00:00.000Z',
          point: { dt: threeHoursLater, temp: 24, pop: 0.2, windSpeedKmh: 10 },
        },
      ],
      observations: [{ updatedAt: noonUtc - 3600, temperature: 18, windSpeedKmh: 6 }],
      includeObservations: true,
    });

    expect(points.length).toBeGreaterThan(3);
    expect(points.some((point) => point.dt === threeHoursLater)).toBe(true);
  });

  it('builds chart axis labels on three-hour clock marks including 18:00', () => {
    const base = Math.floor(Date.UTC(2026, 6, 9, 0, 0, 0) / 1000);
    const coordinates = Array.from({ length: 24 }, (_, hour) => ({
      dt: base + hour * 3600,
      x: hour * 40,
      y: 100,
      value: 10 + hour,
    }));

    const labels = buildChartAxisLabels(coordinates, 'UTC');

    expect(labels.some((label) => label.text === '18:00')).toBe(true);
    expect(labels.map((label) => label.text)).toEqual([
      '00:00',
      '03:00',
      '06:00',
      '09:00',
      '12:00',
      '15:00',
      '18:00',
      '21:00',
    ]);
  });

  it('filters day entries for week and month ranges', () => {
    const days = [
      { dateKey: '2026-07-01', dayLabel: 'Tue' },
      { dateKey: '2026-07-08', dayLabel: 'Tue' },
      { dateKey: '2026-07-09', dayLabel: 'Today' },
      { dateKey: '2026-07-10', dayLabel: 'Fri' },
      { dateKey: '2026-07-15', dayLabel: 'Wed' },
      { dateKey: '2026-08-15', dayLabel: 'Sat' },
    ];

    expect(filterDayEntriesByRange(days, '2026-07-09', 'week').map((day) => day.dateKey)).toEqual([
      '2026-07-09',
      '2026-07-10',
      '2026-07-15',
    ]);

    const monthDays = expandDayEntriesForCalendarMonth(days, '2026-07-09', 'UTC');

    expect(monthDays.length).toBe(31);
    expect(monthDays[0].dateKey).toBe('2026-07-01');
    expect(monthDays[30].dateKey).toBe('2026-07-31');
    expect(monthDays.find((day) => day.dateKey === '2026-07-11')?.isEmpty).toBe(true);
    expect(monthDays.find((day) => day.dateKey === '2026-07-09')?.dayLabel).toBe('Today');

    const trimmedMonthDays = expandDayEntriesForCalendarMonth(
      days.filter((day) => day.dateKey.startsWith('2026-07-')),
      '2026-07-09',
      'UTC',
    );

    expect(trimmedMonthDays.at(-1)?.dateKey).toBe('2026-07-15');
  });
});
