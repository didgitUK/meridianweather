import { describe, expect, it } from 'vitest';
import { buildWeatherPlaceHref } from '@/features/cities/utils/weather-place-href';

describe('buildWeatherPlaceHref', () => {
  it('includes coords and name for dynamic place pages', () => {
    const href = buildWeatherPlaceHref({
      name: 'Farlam',
      country: 'GB',
      lat: 54.9123,
      lon: -2.6789,
      state: 'England',
    });

    expect(href).toMatch(/^\/weather\/farlam\?/);
    expect(href).toContain('lat=54.9123');
    expect(href).toContain('lon=-2.6789');
    expect(href).toContain('name=Farlam');
    expect(href).toContain('country=GB');
  });
});
