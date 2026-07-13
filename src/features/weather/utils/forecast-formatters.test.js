import { describe, expect, it } from 'vitest';
import { TEMPERATURE_UNIT } from '@/constants/temperature-unit';
import { formatDayLabel, formatPop, formatTempRange } from '@/features/weather/utils/forecast-formatters';

describe('forecast-formatters', () => {
  it('formats temperature ranges', () => {
    expect(formatTempRange(10, 18)).toBe('10° / 18°');
    expect(formatTempRange(10, 18, TEMPERATURE_UNIT.FAHRENHEIT)).toBe('50° / 64°');
  });

  it('formats probability of precipitation', () => {
    expect(formatPop(0.42)).toBe('42%');
  });

  it('formats day labels', () => {
    expect(formatDayLabel(1_700_000_000)).toMatch(/\w{3}/);
  });
});
