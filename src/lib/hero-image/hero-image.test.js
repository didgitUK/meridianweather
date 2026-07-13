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
  passesHeroAspectGate,
  pickHeroPhoto,
  resolveUnsplashHeroImage,
} from '@/lib/hero-image/unsplash-resolver';

describe('hero image resolver', () => {
  it('builds cache keys from country and city', () => {
    expect(buildHeroCacheKey({ country: 'GB', city: 'Manchester' })).toBe('country:gb:city:manchester');
    expect(buildHeroCacheKey({ country: 'US' })).toBe('country:us');
  });

  it('builds ranked search queries with city and country fallbacks', () => {
    expect(buildHeroSearchQueries({ country: 'GB', city: 'Manchester' })).toEqual([
      'Manchester United Kingdom landmark',
      'Manchester United Kingdom monument',
      'Manchester skyline',
      'Manchester cityscape',
      'United Kingdom landscape',
    ]);
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

    expect(image?.landscape?.queryUsed).toBe('Manchester United Kingdom landmark');
    expect(image?.portrait?.queryUsed).toBe('Manchester United Kingdom landmark');
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

      if (query === 'Manchester United Kingdom landmark') {
        return {
          ok: true,
          json: async () => ({
            results: [{ width: 100, height: 100, urls: { raw: 'https://images.unsplash.com/bad' } }],
          }),
        };
      }

      if (query === 'Manchester United Kingdom monument') {
        return {
          ok: true,
          json: async () => ({
            results: [{
              width: 1920,
              height: 1080,
              blur_hash: 'abc',
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

    expect(image?.landscape?.queryUsed).toBe('Manchester United Kingdom monument');
    expect(image?.portrait).toBeNull();
  });

  it('returns static fallback when unsplash access key is missing', async () => {
    const image = await getHeroImageForRegion(
      { country: 'GB', city: 'StaticFallbackProbeCity' },
      { accessKey: '' },
    );

    expect(image?.landscape?.imageUrl).toBe('/hero/gb-landscape.svg');
    expect(image?.portrait?.imageUrl).toBe('/hero/gb-portrait.svg');
  });
});
