import { describe, expect, it } from 'vitest';
import { parseGeocodeQuery, parseLatLon, parseScope } from '@/lib/validators';

describe('validators', () => {
  it('validates geocode query length', () => {
    expect(() => parseGeocodeQuery('a')).toThrow();
    expect(parseGeocodeQuery('London')).toBe('London');
  });

  it('validates coordinates', () => {
    expect(parseLatLon('51.5', '-0.1')).toEqual({ lat: 51.5, lon: -0.1 });
    expect(() => parseLatLon('120', '0')).toThrow();
  });

  it('restricts weather scopes', () => {
    expect(parseScope('hourly')).toBe('hourly');
    expect(() => parseScope('alerts')).toThrow();
  });
});
