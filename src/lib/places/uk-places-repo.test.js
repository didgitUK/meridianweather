import { describe, expect, it } from 'vitest';
import { UK_PLACES_PHASE_A } from '@/constants/uk-places-phase-a';
import { UK_PLACES_PHASE_B } from '@/constants/uk-places-phase-b';
import {
  countUkPlaces,
  findUkPlaceBySlug,
  listUkPlaces,
  resolveWeatherPlace,
  seedAllUkPlaces,
  seedUkPlacesPhaseA,
} from '@/lib/places/uk-places-repo';
import {
  countWeatherPlaces,
  upsertWeatherPlace,
} from '@/lib/places/weather-places-repo';

describe('uk places', () => {
  it('ships a Phase A corpus of up to 500 places', () => {
    expect(UK_PLACES_PHASE_A.length).toBeGreaterThan(100);
    expect(UK_PLACES_PHASE_A.length).toBeLessThanOrEqual(500);
    expect(UK_PLACES_PHASE_A[0].slug).toBe('london');
    expect(UK_PLACES_PHASE_A[0].population).toBeGreaterThan(
      UK_PLACES_PHASE_A[UK_PLACES_PHASE_A.length - 1].population,
    );
  });

  it('ships a Phase B corpus for the next popularity band', () => {
    expect(UK_PLACES_PHASE_B.length).toBeGreaterThan(200);
    expect(UK_PLACES_PHASE_B.every((place) => place.country === 'GB')).toBe(true);
  });

  it('seeds and resolves weather place slugs', () => {
    seedUkPlacesPhaseA();
    expect(countUkPlaces()).toBeGreaterThan(0);

    const london = findUkPlaceBySlug('london');
    expect(london?.name).toBe('London');
    expect(london?.country).toBe('GB');

    const city = resolveWeatherPlace('chester');
    expect(city?.name).toBe('Chester');
    expect(city?.seoSlug).toBe('chester');
    expect(city?.lat).toBeTypeOf('number');

    const listed = listUkPlaces({ limit: 10 });
    expect(listed).toHaveLength(10);
    expect(listed[0].population).toBeGreaterThanOrEqual(listed[9].population);
  });

  it('falls back to global weather_places scaffold', () => {
    seedAllUkPlaces();
    upsertWeatherPlace({
      slug: 'paris',
      name: 'Paris',
      country: 'FR',
      adminArea: 'Île-de-France',
      lat: 48.8566,
      lon: 2.3522,
      population: 2_100_000,
      placeType: 'city',
      tier: 3,
    });
    expect(countWeatherPlaces()).toBeGreaterThan(0);
    const city = resolveWeatherPlace('paris');
    expect(city?.name).toBe('Paris');
    expect(city?.country).toBe('FR');
  });
});
