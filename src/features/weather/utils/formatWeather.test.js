import { describe, expect, it } from 'vitest';
import { TEMPERATURE_UNIT } from '@/constants/temperature-unit';
import {
  formatConditionLabel,
  formatTemperature,
  formatWindDirection,
} from '@/features/weather/utils/formatWeather';

describe('formatWeather', () => {
  it('formats temperature with degree symbol', () => {
    expect(formatTemperature(18.4)).toBe('18°');
    expect(formatTemperature(18.4, TEMPERATURE_UNIT.FAHRENHEIT)).toBe('65°');
    expect(formatTemperature(null)).toBe('—');
  });

  it('capitalises condition labels', () => {
    expect(formatConditionLabel('light rain')).toBe('Light rain');
    expect(formatConditionLabel('')).toBe('Unknown');
  });

  it('maps wind degrees to compass points', () => {
    expect(formatWindDirection(0)).toBe('N');
    expect(formatWindDirection(90)).toBe('E');
    expect(formatWindDirection(null)).toBeNull();
  });
});
