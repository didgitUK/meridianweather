import { describe, expect, it } from 'vitest';
import { buildCityId, parseCityId } from '@/lib/utils';

describe('city id utils', () => {
  it('round-trips city ids', () => {
    const id = buildCityId('Dubai', 'AE', 25.2653);
    expect(id).toBe('dubai-AE-25.2653');

    const parsed = parseCityId(id);
    expect(parsed).toEqual({
      id,
      name: 'Dubai',
      country: 'AE',
      lat: 25.2653,
      lon: null,
      state: null,
    });
  });

  it('parses multi-word city names', () => {
    const id = buildCityId('New York', 'US', 40.7128);
    const parsed = parseCityId(id);

    expect(parsed?.name).toBe('New York');
    expect(parsed?.country).toBe('US');
  });
});
