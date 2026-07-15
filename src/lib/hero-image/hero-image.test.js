import { describe, expect, it, vi } from 'vitest';
import {
  HERO_LANDSCAPE_DELIVERY,
  HERO_PORTRAIT_DELIVERY,
} from '@/constants/hero-image';
import { buildHeroCacheKey } from '@/lib/hero-image/build-hero-cache-key';
import { getHeroImageForRegion } from '@/lib/hero-image/get-hero-image-for-region';
import {
  buildHeroDeliveryUrl,
  buildHeroSearchQueries,
  haversineDistanceKm,
  passesHeroAspectGate,
  passesHeroRelevanceGate,
  photoCountryConflicts,
  pickHeroPhoto,
  resolveUnsplashHeroImage,
  scoreHeroPhotoRelevance,
  tokenizePlaceName,
} from '@/lib/hero-image/unsplash-resolver';

describe('hero image resolver', () => {
  it('builds cache keys from country, city, state, and lat bucket', () => {
    expect(buildHeroCacheKey({ country: 'GB', city: 'Manchester' })).toBe(
      'v7:country:gb:city:manchester',
    );
    expect(buildHeroCacheKey({ country: 'GB', city: 'Brampton', state: 'Cumbria', lat: 54.94 })).toBe(
      'v7:country:gb:city:brampton:state:cumbria:lat:54.9',
    );
    expect(buildHeroCacheKey({ country: 'US' })).toBe('v7:country:us');
  });

  it('builds ranked search queries with state-qualified city matches first', () => {
    expect(buildHeroSearchQueries({ country: 'GB', city: 'Brampton', state: 'Cumbria' })).toEqual([
      { query: 'Brampton Cumbria United Kingdom', match: 'place' },
      { query: 'Brampton, Cumbria, United Kingdom', match: 'place' },
      { query: 'Brampton Cumbria England', match: 'place' },
      { query: 'Brampton Cumbria landscape', match: 'place' },
      { query: 'Brampton Cumbria', match: 'place' },
      { query: 'Brampton England', match: 'place' },
      { query: 'Brampton England United Kingdom', match: 'place' },
      { query: 'Brampton England town', match: 'place' },
      { query: 'United Kingdom Brampton', match: 'place' },
      { query: 'Brampton United Kingdom', match: 'place' },
      { query: 'Brampton United Kingdom town', match: 'place' },
      { query: 'Brampton United Kingdom landscape', match: 'place' },
      { query: 'Cumbria United Kingdom landscape', match: 'region' },
      { query: 'Cumbria landscape', match: 'region' },
    ]);
  });

  it('builds ranked search queries with city place tiers and no country tourist fallback', () => {
    expect(buildHeroSearchQueries({ country: 'GB', city: 'Manchester' })).toEqual([
      { query: 'Manchester England', match: 'place' },
      { query: 'Manchester England United Kingdom', match: 'place' },
      { query: 'Manchester England town', match: 'place' },
      { query: 'United Kingdom Manchester', match: 'place' },
      { query: 'Manchester United Kingdom', match: 'place' },
      { query: 'Manchester United Kingdom town', match: 'place' },
      { query: 'Manchester United Kingdom landscape', match: 'place' },
      { query: 'England United Kingdom landscape', match: 'region' },
    ]);
  });

  it('keeps country Unsplash queries only when no city is requested', () => {
    expect(buildHeroSearchQueries({ country: 'AU' })).toEqual([
      { query: 'Australia landscape', match: 'none' },
      { query: 'Australia travel photography', match: 'none' },
    ]);
  });

  it('tokenizes place names and drops saint/article stopwords', () => {
    expect(tokenizePlaceName('St Kitts')).toEqual(['kitts']);
    expect(tokenizePlaceName('South Australia')).toEqual(['south', 'australia']);
  });

  it('scores and gates place photos so twin towns need geographic co-evidence', () => {
    const caribbean = {
      alt_description: 'Beach at St Kitts and Nevis Caribbean',
      location: { country: 'Saint Kitts and Nevis' },
    };
    const saTown = {
      alt_description: 'St Kitts farm South Australia',
      location: { state: 'South Australia', country: 'Australia' },
    };
    const place = {
      city: 'St Kitts',
      state: 'South Australia',
      countryName: 'Australia',
      countryCode: 'AU',
    };

    const caribbeanScore = scoreHeroPhotoRelevance(caribbean, place);
    const saScore = scoreHeroPhotoRelevance(saTown, place);

    expect(caribbeanScore.cityHit).toBe(true);
    expect(passesHeroRelevanceGate(caribbeanScore, 'place', place)).toBe(false);
    expect(saScore.cityHit).toBe(true);
    expect(saScore.stateHit).toBe(true);
    expect(passesHeroRelevanceGate(saScore, 'place', place)).toBe(true);
  });

  it('rejects Canadian Brampton for UK Brampton via country conflict and distance', () => {
    const ontario = {
      alt_description: 'Downtown Brampton Ontario skyline',
      location: {
        city: 'Brampton',
        country: 'Canada',
        position: { latitude: 43.7315, longitude: -79.7624 },
      },
      width: 1920,
      height: 1080,
      id: 'ontario',
    };
    const cumbria = {
      alt_description: 'Brampton Cumbria England market town',
      location: {
        city: 'Brampton',
        country: 'United Kingdom',
        position: { latitude: 54.9434, longitude: -2.7369 },
      },
      width: 1920,
      height: 1080,
      id: 'cumbria',
    };
    const place = {
      city: 'Brampton',
      state: 'Cumbria',
      countryName: 'United Kingdom',
      countryCode: 'GB',
      lat: 54.9434,
      lon: -2.7369,
    };

    expect(photoCountryConflicts('Canada', 'GB')).toBe(true);
    expect(haversineDistanceKm(54.9434, -2.7369, 43.7315, -79.7624)).toBeGreaterThan(400);

    const ontarioScore = scoreHeroPhotoRelevance(ontario, place);
    expect(ontarioScore.countryConflict).toBe(true);
    expect(ontarioScore.geoTooFar).toBe(true);
    expect(passesHeroRelevanceGate(ontarioScore, 'place', place)).toBe(false);

    expect(
      pickHeroPhoto([ontario, cumbria], 'landscape', { match: 'place', place })?.id,
    ).toBe('cumbria');
  });

  it('rejects national tourist photos that only match country during place search', () => {
    const sydney = {
      alt_description: 'Sydney Opera House Australia',
      width: 1920,
      height: 1080,
      id: 'sydney',
    };
    const picked = pickHeroPhoto([sydney], 'landscape', {
      match: 'place',
      place: {
        city: 'St Kitts',
        state: 'South Australia',
        countryName: 'Australia',
        countryCode: 'AU',
      },
    });

    expect(picked).toBeNull();
  });

  it('accepts near-16:9 landscape and near-9:16 portrait sizes', () => {
    expect(passesHeroAspectGate(1920, 1080, 'landscape')).toBe(true);
    expect(passesHeroAspectGate(1080, 1920, 'portrait')).toBe(true);
  });

  it('rejects square, tiny, and wrong-orientation photos', () => {
    expect(passesHeroAspectGate(1600, 1600, 'landscape')).toBe(false);
    expect(passesHeroAspectGate(800, 450, 'landscape')).toBe(false);
    expect(passesHeroAspectGate(1080, 1920, 'landscape')).toBe(false);
    expect(passesHeroAspectGate(1920, 1080, 'portrait')).toBe(false);
    expect(passesHeroAspectGate(1200, 1600, 'portrait')).toBe(false);
    expect(passesHeroAspectGate(700, 1400, 'portrait')).toBe(false);
  });

  it('picks the first gated photo and never falls back to results[0]', () => {
    const results = [
      { width: 1600, height: 1600 },
      { width: 1920, height: 1080, id: 'good' },
      { width: 2000, height: 1125, id: 'also-good' },
    ];

    expect(pickHeroPhoto(results, 'landscape')?.id).toBe('good');
    expect(pickHeroPhoto([{ width: 100, height: 100 }], 'landscape')).toBeNull();
  });

  it('can exclude a current photo when cycling heroes', () => {
    const results = [
      {
        id: 'current',
        width: 1920,
        height: 1080,
        urls: { raw: 'https://images.unsplash.com/photo-current' },
      },
      {
        id: 'next',
        width: 2000,
        height: 1125,
        urls: { raw: 'https://images.unsplash.com/photo-next' },
      },
    ];

    expect(
      pickHeroPhoto(results, 'landscape', {
        excludePhotoIds: ['current'],
      })?.id,
    ).toBe('next');
    expect(
      pickHeroPhoto(results, 'landscape', {
        excludeImageUrls: ['https://images.unsplash.com/photo-current'],
      })?.id,
    ).toBe('next');
  });

  it('builds entropy-crop delivery urls from raw Unsplash urls', () => {
    const url = buildHeroDeliveryUrl('https://images.unsplash.com/photo-1?ixid=abc', HERO_LANDSCAPE_DELIVERY);
    expect(url).toContain('w=2400');
    expect(url).toContain('h=1350');
    expect(url).toContain('fit=crop');
    expect(url).toContain('crop=entropy');
    expect(url).toContain('fm=webp');

    const portraitUrl = buildHeroDeliveryUrl('https://images.unsplash.com/photo-2', HERO_PORTRAIT_DELIVERY);
    expect(portraitUrl).toContain('w=1080');
    expect(portraitUrl).toContain('h=1920');
  });

  it('resolves landscape and portrait independently', async () => {
    const fetchImpl = vi.fn(async (input) => {
      const url = String(input);
      const orientation = new URL(url).searchParams.get('orientation');

      if (orientation === 'landscape') {
        return {
          ok: true,
          json: async () => ({
            results: [{
              width: 1920,
              height: 1080,
              blur_hash: 'abc',
              alt_description: 'Manchester United Kingdom skyline',
              urls: { raw: 'https://images.unsplash.com/photo-landscape' },
              user: { name: 'Alex', links: { html: 'https://unsplash.com/@alex' } },
              links: { html: 'https://unsplash.com/photos/landscape' },
            }],
          }),
        };
      }

      return {
        ok: true,
        json: async () => ({
          results: [{
            width: 1080,
            height: 1920,
            blur_hash: 'def',
            alt_description: 'Manchester United Kingdom street',
            urls: { raw: 'https://images.unsplash.com/photo-portrait' },
            user: { name: 'Sam', links: { html: 'https://unsplash.com/@sam' } },
            links: { html: 'https://unsplash.com/photos/portrait' },
          }],
        }),
      };
    });

    const image = await resolveUnsplashHeroImage(
      { country: 'GB', city: 'Manchester' },
      { fetchImpl, accessKey: 'test-key' },
    );

    expect(image?.landscape?.queryUsed).toBe('Manchester England');
    expect(image?.portrait?.queryUsed).toBe('Manchester England');
    expect(image?.landscape?.imageUrl).toContain('w=2400');
    expect(image?.portrait?.imageUrl).toContain('h=1920');
    expect(image?.photographer).toBe('Alex');
    expect(fetchImpl.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('skips failing queries until a gated photo is found', async () => {
    const landscapeCallsByQuery = new Map();

    const fetchImpl = vi.fn(async (input) => {
      const url = new URL(String(input));
      const orientation = url.searchParams.get('orientation');
      const query = url.searchParams.get('query');

      if (orientation === 'portrait') {
        return { ok: true, json: async () => ({ results: [] }) };
      }

      const callIndex = landscapeCallsByQuery.get(query) ?? 0;
      landscapeCallsByQuery.set(query, callIndex + 1);

      if (query === 'Manchester England') {
        return {
          ok: true,
          json: async () => ({
            results: [{ width: 100, height: 100, urls: { raw: 'https://images.unsplash.com/bad' } }],
          }),
        };
      }

      if (query === 'Manchester England town') {
        return {
          ok: true,
          json: async () => ({
            results: [{
              width: 1920,
              height: 1080,
              blur_hash: 'abc',
              alt_description: 'Manchester England United Kingdom town centre',
              location: { country: 'United Kingdom' },
              urls: { raw: 'https://images.unsplash.com/photo-1' },
              user: { name: 'Alex', links: { html: 'https://unsplash.com/@alex' } },
              links: { html: 'https://unsplash.com/photos/1' },
            }],
          }),
        };
      }

      return { ok: true, json: async () => ({ results: [] }) };
    });

    const image = await resolveUnsplashHeroImage(
      { country: 'GB', city: 'Manchester' },
      { fetchImpl, accessKey: 'test-key' },
    );

    expect(image?.landscape?.queryUsed).toBe('Manchester England town');
    expect(image?.portrait).toBeNull();
  });

  it('falls through to static when only country tourist photos would match a small town', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        results: [{
          width: 1920,
          height: 1080,
          alt_description: 'Sydney Opera House at dusk Australia',
          urls: { raw: 'https://images.unsplash.com/photo-sydney' },
          user: { name: 'Tourist', links: { html: 'https://unsplash.com/@tourist' } },
          links: { html: 'https://unsplash.com/photos/sydney' },
        }],
      }),
    }));

    const image = await getHeroImageForRegion(
      { country: 'AU', city: 'St Kitts', state: 'South Australia' },
      { fetchImpl, accessKey: 'test-key', force: true },
    );

    expect(image?.landscape?.queryUsed).toBe('static-fallback');
  });

  it('returns static fallback when unsplash access key is missing', async () => {
    const image = await getHeroImageForRegion(
      { country: 'GB', city: 'StaticFallbackProbeCity' },
      {
        accessKey: '',
        resolveHero: async () => null,
      },
    );

    expect(image?.landscape?.imageUrl).toBe('/hero/gb-landscape.svg');
    expect(image?.portrait?.imageUrl).toBe('/hero/gb-portrait.svg');
  });

  it('falls through to Wikimedia via injected cascade when Unsplash misses', async () => {
    const image = await getHeroImageForRegion(
      { country: 'GB', city: 'Brampton', state: 'Cumbria', lat: 54.94, lon: -2.73 },
      {
        force: true,
        resolveHero: async () => ({
          landscape: {
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/brampton.jpg',
            photographer: 'Wiki',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Brampton.jpg',
            sourceName: 'wikimedia',
            unsplashUrl: 'https://commons.wikimedia.org/wiki/File:Brampton.jpg',
          },
          portrait: null,
          sourceName: 'wikimedia',
          sourceUrl: 'https://commons.wikimedia.org/wiki/File:Brampton.jpg',
          unsplashUrl: 'https://commons.wikimedia.org/wiki/File:Brampton.jpg',
        }),
      },
    );

    expect(image?.sourceName).toBe('wikimedia');
    expect(image?.landscape?.imageUrl).toContain('upload.wikimedia.org');
  });
});
