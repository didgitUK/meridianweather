import { describe, expect, it } from 'vitest';
import {
  buildCountyDedupeKey,
  enrichAndDedupeGeocodeResults,
  hasAmbiguousGeocodeResults,
  pickCountyLabel,
} from '@/lib/geocode-enrichment';

describe('geocode-enrichment', () => {
  it('detects ambiguous geocode groups', () => {
    const results = [
      { name: 'Blackpool', state: 'England', country: 'GB', lat: 53.8, lon: -3.0 },
      { name: 'Blackpool', state: 'England', country: 'GB', lat: 50.3, lon: -3.6 },
    ];

    expect(hasAmbiguousGeocodeResults(results)).toBe(true);
  });

  it('maps reverse geocode names to county labels', () => {
    expect(pickCountyLabel('Blackpool', 'South Hams')).toBe('South Hams');
    expect(pickCountyLabel('Blackpool', 'Borough of Blackpool')).toBe('Borough of Blackpool');
    expect(pickCountyLabel('Blackpool', 'Cork')).toBe('Cork');
  });

  it('dedupes results that resolve to the same county', async () => {
    const results = [
      { name: 'Blackpool', state: 'England', country: 'GB', lat: 50.37, lon: -4.01 },
      { name: 'Blackpool', state: 'England', country: 'GB', lat: 50.32, lon: -3.61 },
      { name: 'Blackpool', state: 'England', country: 'GB', lat: 53.82, lon: -3.05 },
    ];

    const enriched = await enrichAndDedupeGeocodeResults(results, 'blackpool', null, {
      reverseLookup: async (lat) => {
        if (lat > 53) return { name: 'Borough of Blackpool' };
        return { name: 'South Hams' };
      },
    });

    expect(enriched).toHaveLength(2);
    expect(enriched.map((result) => result.county).sort()).toEqual([
      'Borough of Blackpool',
      'South Hams',
    ]);
    expect(buildCountyDedupeKey(enriched[0])).not.toBe(buildCountyDedupeKey(enriched[1]));
  });
});
