import { describe, expect, it, afterEach } from 'vitest';
import { isCityHeroOsmEnabled } from '@/features/weather/components/CityDetailOsmBackdrop';

describe('isCityHeroOsmEnabled', () => {
  const previous = process.env.NEXT_PUBLIC_CITY_HERO_OSM;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.NEXT_PUBLIC_CITY_HERO_OSM;
    } else {
      process.env.NEXT_PUBLIC_CITY_HERO_OSM = previous;
    }
  });

  it('defaults to enabled when unset', () => {
    delete process.env.NEXT_PUBLIC_CITY_HERO_OSM;
    expect(isCityHeroOsmEnabled()).toBe(true);
  });

  it('can be disabled with 0', () => {
    process.env.NEXT_PUBLIC_CITY_HERO_OSM = '0';
    expect(isCityHeroOsmEnabled()).toBe(false);
  });
});
