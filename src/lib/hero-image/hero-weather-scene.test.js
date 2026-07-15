import { describe, expect, it } from 'vitest';
import {
  HERO_WEATHER_SCENE,
  deriveHeroWeatherScene,
  photoConflictsWeatherScene,
  scoreWeatherSceneBonus,
  withHeroWeatherScene,
} from '@/lib/hero-image/hero-weather-scene';
import { buildHeroCacheKey } from '@/lib/hero-image/build-hero-cache-key';
import {
  buildHeroSearchQueries,
  passesHeroRelevanceGate,
  scoreHeroPhotoRelevance,
} from '@/lib/hero-image/unsplash-resolver';

describe('hero weather scene', () => {
  it('derives hot-clear from clear sky + high temperature', () => {
    expect(
      deriveHeroWeatherScene({ weatherId: 800, temperature: 31, condition: 'Clear' }),
    ).toBe(HERO_WEATHER_SCENE.HOT_CLEAR);
  });

  it('derives snow from weather id 600+', () => {
    expect(deriveHeroWeatherScene({ weatherId: 601, temperature: -2 })).toBe(
      HERO_WEATHER_SCENE.SNOW,
    );
  });

  it('rejects snow captions on hot-clear days', () => {
    expect(photoConflictsWeatherScene('snow covered brampton street', HERO_WEATHER_SCENE.HOT_CLEAR)).toBe(
      true,
    );
    expect(photoConflictsWeatherScene('sunny summer market town', HERO_WEATHER_SCENE.HOT_CLEAR)).toBe(
      false,
    );
  });

  it('rejects beach/summer captions on snow days', () => {
    expect(photoConflictsWeatherScene('tropical beach summer vibes', HERO_WEATHER_SCENE.SNOW)).toBe(
      true,
    );
  });

  it('boosts matching scene tokens', () => {
    expect(scoreWeatherSceneBonus('sunny summer blue sky', HERO_WEATHER_SCENE.HOT_CLEAR)).toBeGreaterThan(
      0,
    );
  });

  it('adds weatherScene onto region payloads', () => {
    const next = withHeroWeatherScene(
      { city: 'Brampton', country: 'GB' },
      { weatherId: 800, temperature: 28 },
    );
    expect(next.weatherScene).toBe(HERO_WEATHER_SCENE.HOT_CLEAR);
  });

  it('partitions cache keys by weather scene', () => {
    expect(
      buildHeroCacheKey({
        country: 'GB',
        city: 'Brampton',
        state: 'Cumbria',
        lat: 54.94,
        weatherScene: HERO_WEATHER_SCENE.HOT_CLEAR,
      }),
    ).toBe('v7:country:gb:city:brampton:state:cumbria:lat:54.9:scene:hot-clear');
  });

  it('prefers weather-cued place queries first', () => {
    const queries = buildHeroSearchQueries({
      country: 'GB',
      city: 'Brampton',
      state: 'Cumbria',
      weatherScene: HERO_WEATHER_SCENE.HOT_CLEAR,
    });
    expect(queries[0].query).toContain('sunny summer');
    expect(queries[0].match).toBe('place');
  });

  it('gates out snow photos when the live scene is hot-clear', () => {
    const place = {
      city: 'Brampton',
      state: 'Cumbria',
      countryName: 'United Kingdom',
      countryCode: 'GB',
      weatherScene: HERO_WEATHER_SCENE.HOT_CLEAR,
    };
    const snowPhoto = {
      alt_description: 'Brampton Cumbria United Kingdom snow covered market',
      location: { city: 'Brampton', country: 'United Kingdom' },
    };
    const relevance = scoreHeroPhotoRelevance(snowPhoto, place);
    expect(relevance.weatherConflict).toBe(true);
    expect(passesHeroRelevanceGate(relevance, 'place', place)).toBe(false);
  });
});
