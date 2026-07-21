import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/cities/utils/checked-city-store', () => ({
  listRecentCheckedCities: vi.fn(),
}));

import { listRecentCheckedCities } from '@/features/cities/utils/checked-city-store';
import { buildPriorityCities } from '@/features/pwa/priority-cities-store';

describe('buildPriorityCities', () => {
  beforeEach(() => {
    vi.mocked(listRecentCheckedCities).mockReturnValue([]);
  });

  it('returns pinned cities first and dedupes recent checks', () => {
    vi.mocked(listRecentCheckedCities).mockReturnValue([
      {
        id: 'pinned-1',
        name: 'Pinned',
        country: 'GB',
        lat: 53.48,
        lon: -2.24,
      },
      {
        id: 'recent-1',
        name: 'Recent',
        country: 'GB',
        lat: 53.8,
        lon: -1.55,
      },
    ]);

    const cities = buildPriorityCities({
      savedCities: [
        {
          id: 'pinned-1',
          name: 'Pinned',
          country: 'GB',
          lat: 53.48,
          lon: -2.24,
        },
      ],
      recentLimit: 5,
    });

    expect(cities.map((city) => city.id)).toEqual(['pinned-1', 'recent-1']);
  });

  it('skips cities without coordinates', () => {
    const cities = buildPriorityCities({
      savedCities: [
        { id: 'bad', name: 'Bad', country: 'GB', lat: 'x', lon: null },
        { id: 'ok', name: 'Ok', country: 'GB', lat: 1, lon: 2 },
      ],
    });

    expect(cities).toHaveLength(1);
    expect(cities[0].id).toBe('ok');
  });

  it('caps total priority cities', () => {
    vi.mocked(listRecentCheckedCities).mockReturnValue(
      Array.from({ length: 8 }, (_, index) => ({
        id: `recent-${index}`,
        name: `R${index}`,
        country: 'GB',
        lat: 50 + index,
        lon: -1,
      })),
    );

    const cities = buildPriorityCities({
      savedCities: Array.from({ length: 10 }, (_, index) => ({
        id: `pin-${index}`,
        name: `P${index}`,
        country: 'GB',
        lat: 53 + index * 0.01,
        lon: -2,
      })),
      maxCities: 12,
    });

    expect(cities).toHaveLength(12);
  });
});
