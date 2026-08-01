import { describe, expect, it } from 'vitest';
import { diurnalWashStyle } from '@/features/weather/utils/hero-weather-timeline';

describe('diurnalWashStyle', () => {
  it('returns deep night navy at full night', () => {
    const night = diurnalWashStyle(1);
    expect(night.washColor).toBe('rgb(2 6 18)');
    expect(night.wash).toBeGreaterThan(0.8);
    expect(night.satFilter).toContain('brightness(');
  });

  it('returns a brighter sat grade by day', () => {
    const day = diurnalWashStyle(0);
    const night = diurnalWashStyle(1);
    expect(day.wash).toBe(0);
    expect(day.satFilter).toContain('brightness(1)');
    expect(night.satFilter).not.toBe(day.satFilter);
  });

  it('shifts toward amber in early twilight', () => {
    const dusk = diurnalWashStyle(0.2);
    expect(dusk.washColor).toMatch(/^rgb\(\d+ \d+ \d+\)$/);
    expect(dusk.wash).toBeGreaterThan(0);
    expect(dusk.wash).toBeLessThan(0.5);
  });
});
