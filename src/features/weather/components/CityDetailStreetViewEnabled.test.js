import { describe, expect, it, afterEach } from 'vitest';
import { isCityHeroStreetViewEnabled } from '@/features/weather/components/CityDetailStreetViewBackdrop';

describe('isCityHeroStreetViewEnabled', () => {
  const previous = process.env.NEXT_PUBLIC_CITY_HERO_STREET_VIEW;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.NEXT_PUBLIC_CITY_HERO_STREET_VIEW;
    } else {
      process.env.NEXT_PUBLIC_CITY_HERO_STREET_VIEW = previous;
    }
  });

  it('defaults to disabled when unset', () => {
    delete process.env.NEXT_PUBLIC_CITY_HERO_STREET_VIEW;
    expect(isCityHeroStreetViewEnabled()).toBe(false);
  });

  it('enables only when set to 1', () => {
    process.env.NEXT_PUBLIC_CITY_HERO_STREET_VIEW = '1';
    expect(isCityHeroStreetViewEnabled()).toBe(true);
  });
});
