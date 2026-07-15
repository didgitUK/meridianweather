import { describe, expect, it } from 'vitest';
import { TEMPERATURE_UNIT } from '@/constants/temperature-unit';
import {
  buildConsecutiveDailyRows,
  formatCalendarDayKey,
  formatDayLabel,
  formatPop,
  formatTempRange,
  shiftCalendarDayKey,
} from '@/features/weather/utils/forecast-formatters';

describe('forecast-formatters', () => {
  it('formats temperature ranges', () => {
    expect(formatTempRange(10, 18)).toBe('10°C / 18°C');
    expect(formatTempRange(10, 18, TEMPERATURE_UNIT.FAHRENHEIT)).toBe('50°F / 64°F');
  });

  it('formats probability of precipitation', () => {
    expect(formatPop(0.42)).toBe('42%');
  });

  it('formats day labels', () => {
    expect(formatDayLabel(1_700_000_000)).toMatch(/\w{3}/);
  });

  it('keeps weekday and calendar date aligned for a date key', () => {
    const sunday = formatCalendarDayKey('2026-07-19');
    expect(sunday.weekday).toBe('Sun');
    expect(sunday.dayMonth).toBe('19 Jul');
    expect(sunday.year).toBe('2026');
    expect(shiftCalendarDayKey('2026-07-19', 1)).toBe('2026-07-20');
  });

  it('builds seven consecutive weekdays without skipping Sunday', () => {
    const dubaiOffset = 4 * 3600;
    function dayStart(day) {
      return Math.floor((Date.UTC(2026, 6, day, 0, 0, 0) - dubaiOffset * 1000) / 1000);
    }

    const points = [
      { dt: dayStart(13), tempMin: 27, tempMax: 27, icon: '01d' },
      { dt: dayStart(14), tempMin: 26, tempMax: 32, icon: '01d' },
      { dt: dayStart(15), tempMin: 26, tempMax: 31, icon: '01d' },
      { dt: dayStart(16), tempMin: 25, tempMax: 32, icon: '01d' },
      { dt: dayStart(17), tempMin: 25, tempMax: 31, icon: '01d' },
      { dt: dayStart(18), tempMin: 25, tempMax: 31, icon: '01d' },
      // deliberate gap: no Sunday 19
      { dt: dayStart(20), tempMin: 33, tempMax: 37, icon: '01d' },
    ];

    const rows = buildConsecutiveDailyRows(points, {
      count: 7,
      timezoneOffset: dubaiOffset,
    });

    expect(rows).toHaveLength(7);
    expect(rows.map((row) => row.weekday)).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]);
    expect(rows.map((row) => row.dateKey)).toEqual([
      '2026-07-13',
      '2026-07-14',
      '2026-07-15',
      '2026-07-16',
      '2026-07-17',
      '2026-07-18',
      '2026-07-19',
    ]);
    expect(rows[6].point).toBeNull();
    expect(rows[6].dayMonth).toBe('19 Jul');
    expect(rows[6].year).toBe('2026');
  });
});
