import { describe, expect, it } from 'vitest';
import { pickNearbyMapPlaces } from '@/features/weather/utils/nearby-places';

describe('pickNearbyMapPlaces', () => {
  it('returns nearby North England places around Carlisle', () => {
    const places = pickNearbyMapPlaces(54.8951, -2.9382, { excludeName: 'Carlisle' });
    expect(places.length).toBeGreaterThanOrEqual(3);
    expect(places.length).toBeLessThanOrEqual(5);
    expect(places.every((place) => place.name !== 'Carlisle')).toBe(true);
    expect(places[0].distanceKm).toBeLessThan(places.at(-1).distanceKm + 0.001);
  });
});
