import { describe, expect, it } from 'vitest';
import {
  mergeAndRankGeocodeResults,
  searchPopularCities,
  scoreGeocodeResult,
} from './geocode-ranking';

describe('geocode-ranking', () => {
  it('surfaces London when typing LON', () => {
    const results = searchPopularCities('lon');

    expect(results[0]?.name).toBe('London');
    expect(results[0]?.country).toBe('GB');
  });

  it('ranks exact matches above partial matches', () => {
    const paris = { name: 'Paris', country: 'FR', lat: 48.85, lon: 2.35, population: 2_100_000, label: 'Paris, FR' };
    const parisTx = { name: 'Paris', state: 'TX', country: 'US', lat: 33.66, lon: -95.55, population: 25_000, label: 'Paris, TX, US' };

    expect(scoreGeocodeResult(paris, 'paris')).toBeGreaterThan(scoreGeocodeResult(parisTx, 'paris'));
  });

  it('merges local and api results with population priority', () => {
    const local = searchPopularCities('lon', 3);
    const api = [
      { name: 'Long Beach', state: 'CA', country: 'US', lat: 33.77, lon: -118.19, label: 'Long Beach, CA, US' },
      { name: 'London', state: 'KY', country: 'US', lat: 37.13, lon: -84.08, label: 'London, KY, US' },
    ];

    const ranked = mergeAndRankGeocodeResults('lon', local, api);

    expect(ranked[0]?.name).toBe('London');
    expect(ranked[0]?.country).toBe('GB');
  });

  it('does not rank unrelated megacities when the name does not match', () => {
    const popular = searchPopularCities('bolton');

    expect(popular.some((city) => city.name === 'Delhi')).toBe(false);
    expect(popular.some((city) => city.name === 'Beijing')).toBe(false);
  });

  it('filters api filler results that do not match the query name', () => {
    const ranked = mergeAndRankGeocodeResults('bolton', [], [
      { name: 'Bolton', state: 'England', country: 'GB', lat: 53.578, lon: -2.43, label: 'Bolton, England, GB' },
      { name: 'Delhi', country: 'IN', lat: 28.7041, lon: 77.1025, label: 'Delhi, IN' },
      { name: 'India', country: 'IN', lat: 20.5937, lon: 78.9629, label: 'India, IN' },
    ]);

    expect(ranked.map((city) => city.name)).toEqual(['Bolton']);
  });

  it('ranks same-name cities closer to the user first', () => {
    const ranked = mergeAndRankGeocodeResults(
      'bolton',
      [],
      [
        { name: 'Bolton', state: 'England', country: 'GB', lat: 53.578, lon: -2.43, label: 'Bolton, England, GB' },
        { name: 'Bolton', state: 'Connecticut', country: 'US', lat: 41.8, lon: -72.68, label: 'Bolton, Connecticut, US' },
      ],
      8,
      { country: 'GB', lat: 53.48, lon: -2.24 },
    );

    expect(ranked[0]?.country).toBe('GB');
  });

  it('dedupes identical coordinates', () => {
    const ranked = mergeAndRankGeocodeResults(
      'london',
      searchPopularCities('london', 1),
      [
        {
          name: 'London',
          state: 'England',
          country: 'GB',
          lat: 51.5073,
          lon: -0.1276,
          label: 'London, England, GB',
        },
      ],
    );

    expect(ranked).toHaveLength(1);
  });
});
