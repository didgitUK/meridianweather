import { describe, expect, it, vi } from 'vitest';
import { HERO_SOURCE } from '@/constants/hero-sources';
import { adaptPexelsPhoto } from '@/lib/hero-image/pexels-resolver';
import { resolveHeroImage } from '@/lib/hero-image/resolve-hero-image';
import {
  adaptWikimediaPageToPhoto,
  stripWikiHtml,
} from '@/lib/hero-image/wikimedia-resolver';
import { inferHeroSourceName } from '@/lib/hero-image/infer-hero-source';

describe('resolveHeroImage cascade', () => {
  const region = {
    country: 'GB',
    city: 'Brampton',
    state: 'Cumbria',
    lat: 54.9434,
    lon: -2.7369,
  };

  it('returns Unsplash when the first provider hits', async () => {
    const unsplashResolver = vi.fn(async () => ({
      landscape: {
        imageUrl: 'https://images.unsplash.com/photo-uk',
        photographer: 'Alex',
        sourceUrl: 'https://unsplash.com/photos/uk',
        sourceName: HERO_SOURCE.UNSPLASH,
      },
      portrait: null,
    }));
    const wikimediaResolver = vi.fn(async () => null);
    const pexelsResolver = vi.fn(async () => null);

    const image = await resolveHeroImage(region, {
      unsplashResolver,
      wikimediaResolver,
      pexelsResolver,
    });

    expect(image?.sourceName).toBe(HERO_SOURCE.UNSPLASH);
    expect(image?.landscape?.imageUrl).toContain('unsplash.com');
    expect(wikimediaResolver).not.toHaveBeenCalled();
    expect(pexelsResolver).not.toHaveBeenCalled();
  });

  it('falls through to Wikimedia when Unsplash misses', async () => {
    const image = await resolveHeroImage(region, {
      unsplashResolver: vi.fn(async () => null),
      wikimediaResolver: vi.fn(async () => ({
        landscape: {
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/brampton.jpg',
          photographer: 'Wiki User',
          sourceUrl: 'https://commons.wikimedia.org/wiki/File:Brampton.jpg',
          sourceName: HERO_SOURCE.WIKIMEDIA,
        },
        portrait: null,
      })),
      pexelsResolver: vi.fn(async () => ({
        landscape: {
          imageUrl: 'https://images.pexels.com/photos/1/pexels.jpeg',
          sourceName: HERO_SOURCE.PEXELS,
        },
      })),
    });

    expect(image?.sourceName).toBe(HERO_SOURCE.WIKIMEDIA);
    expect(image?.unsplashUrl).toContain('commons.wikimedia.org');
  });

  it('falls through to Pexels when Unsplash and Wikimedia miss', async () => {
    const image = await resolveHeroImage(region, {
      unsplashResolver: vi.fn(async () => null),
      wikimediaResolver: vi.fn(async () => null),
      pexelsResolver: vi.fn(async () => ({
        landscape: {
          imageUrl: 'https://images.pexels.com/photos/99/pexels-photo.jpeg',
          photographer: 'Sam',
          sourceUrl: 'https://www.pexels.com/photo/99/',
          sourceName: HERO_SOURCE.PEXELS,
        },
        portrait: null,
      })),
    });

    expect(image?.sourceName).toBe(HERO_SOURCE.PEXELS);
    expect(image?.landscape?.photographer).toBe('Sam');
  });

  it('returns null when every provider misses', async () => {
    const image = await resolveHeroImage(region, {
      unsplashResolver: vi.fn(async () => null),
      wikimediaResolver: vi.fn(async () => null),
      pexelsResolver: vi.fn(async () => null),
    });

    expect(image).toBeNull();
  });
});

describe('provider adapters', () => {
  it('strips wiki html from artist credit', () => {
    expect(stripWikiHtml('<a href="/wiki/User:A">Alice</a>')).toBe('Alice');
  });

  it('adapts Wikimedia page imageinfo for scoring', () => {
    const photo = adaptWikimediaPageToPhoto({
      pageid: 1,
      title: 'File:Brampton Market.jpg',
      coordinates: [{ lat: 54.94, lon: -2.73 }],
      imageinfo: [{
        url: 'https://upload.wikimedia.org/wikipedia/commons/b/brampton.jpg',
        width: 1920,
        height: 1080,
        descriptionurl: 'https://commons.wikimedia.org/wiki/File:Brampton_Market.jpg',
        extmetadata: {
          Artist: { value: '<b>Local Photographer</b>' },
          ImageDescription: { value: 'Brampton Cumbria market square' },
        },
      }],
    });

    expect(photo?.user?.name).toBe('Local Photographer');
    expect(photo?.location?.position?.latitude).toBeCloseTo(54.94);
    expect(photo?.width).toBe(1920);
  });

  it('adapts Pexels photos into the shared scorer shape', () => {
    const photo = adaptPexelsPhoto({
      id: 42,
      width: 2000,
      height: 1125,
      alt: 'Brampton England street',
      photographer: 'Sam',
      photographer_url: 'https://www.pexels.com/@sam',
      url: 'https://www.pexels.com/photo/42/',
      src: {
        original: 'https://images.pexels.com/photos/42/original.jpeg',
        large2x: 'https://images.pexels.com/photos/42/large.jpeg',
      },
    });

    expect(photo?.id).toBe(42);
    expect(photo?.user?.name).toBe('Sam');
    expect(photo?.urls?.raw).toContain('pexels.com');
  });

  it('infers source names from credit and CDN urls', () => {
    expect(inferHeroSourceName('https://unsplash.com/photos/1', null)).toBe(HERO_SOURCE.UNSPLASH);
    expect(
      inferHeroSourceName(
        'https://commons.wikimedia.org/wiki/File:X.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/x.jpg',
      ),
    ).toBe(HERO_SOURCE.WIKIMEDIA);
    expect(
      inferHeroSourceName('https://www.pexels.com/photo/1/', 'https://images.pexels.com/photos/1.jpg'),
    ).toBe(HERO_SOURCE.PEXELS);
  });
});
