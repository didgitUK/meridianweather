import { describe, expect, it } from 'vitest';
import {
  buildPlaceDetailHref,
  buildWeatherPlaceHref,
} from '@/features/cities/utils/weather-place-href';

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

describe('buildPlaceDetailHref', () => {
  it('routes GB places to /weather with coords', () => {
    const href = buildPlaceDetailHref({
      name: 'Carlisle',
      country: 'GB',
      lat: 54.8951,
      lon: -2.9382,
      state: 'England',
    });

    expect(href).toMatch(/^\/weather\/carlisle\?/);
    expect(href).toContain('lat=54.8951');
    expect(href).toContain('lon=-2.9382');
  });

  it('routes UK alias to /weather', () => {
    const href = buildPlaceDetailHref({
      cityName: 'York',
      country: 'UK',
      lat: 53.9600,
      lon: -1.0873,
    });

    expect(href).toMatch(/^\/weather\/york\?/);
    expect(href).toContain('country=GB');
  });

  it('routes non-GB places to /city', () => {
    const href = buildPlaceDetailHref({
      name: 'Paris',
      country: 'FR',
      lat: 48.8566,
      lon: 2.3522,
    });

    expect(href).toMatch(/^\/city\/paris-FR-48\.8566$/);
  });

  it('uses seoSlug when provided for GB places', () => {
    const href = buildPlaceDetailHref({
      name: 'Newcastle',
      country: 'GB',
      lat: 54.9783,
      lon: -1.6178,
      seoSlug: 'newcastle-upon-tyne',
    });

    expect(href).toMatch(/^\/weather\/newcastle-upon-tyne\?/);
  });
});
