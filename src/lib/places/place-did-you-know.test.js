import { describe, expect, it } from 'vitest';
import { resolvePlaceDidYouKnow } from '@/lib/places/place-did-you-know';

describe('resolvePlaceDidYouKnow', () => {
  it('returns a stable fact for the same city', () => {
    const city = {
      name: 'Chester',
      country: 'GB',
      state: 'England',
      lat: 53.1934,
      lon: -2.893,
    };
    const a = resolvePlaceDidYouKnow(city);
    const b = resolvePlaceDidYouKnow(city);
    expect(a).toEqual(b);
    expect(a?.key).toMatch(/^(lat|equator|prime|region)$/);
    expect(a?.params.city).toBe('Chester');
  });

  it('returns null without a city name', () => {
    expect(resolvePlaceDidYouKnow({ lat: 1, lon: 2 })).toBeNull();
  });
});
