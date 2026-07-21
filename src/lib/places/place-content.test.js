import { describe, expect, it } from 'vitest';
import {
  PLACE_GUIDE_MIN_WORDS,
  PLACE_GUIDE_REQUIRED_H2,
  PLACE_POI_CATEGORIES,
} from '@/constants/place-content';
import {
  capPlacePois,
  classifyOsmTags,
  mapOverpassElement,
  buildOverpassQuery,
} from '@/lib/places/overpass-pois';
import { parseRssItems as parseRssFromPipeline } from '@/lib/places/place-content-pipeline';
import {
  countWordsFromHtml,
  extractH2Texts,
  looksLikeSourcePaste,
  validatePlaceArticle,
} from '@/lib/places/validate-place-article';
import { buildStubPlaceGuide } from '@/lib/places/stub-place-guide';
import {
  replacePlacePois,
  listPlacePois,
  countPlacePois,
  getPlacePoi,
} from '@/lib/places/place-pois-repo';
import {
  upsertPlaceArticle,
  getPlaceArticle,
  listPublishedPlaceArticles,
} from '@/lib/places/place-articles-repo';
import { PLACE_ARTICLE_STATUS } from '@/constants/place-content';
import { replacePlaceLocalLinks, listPlaceLocalLinks } from '@/lib/places/place-local-links-repo';

describe('place content OSM helpers', () => {
  it('classifies OSM tags into Meridian categories', () => {
    expect(classifyOsmTags({ amenity: 'restaurant', name: 'X' })).toBe(
      PLACE_POI_CATEGORIES.restaurants,
    );
    expect(classifyOsmTags({ leisure: 'playground', name: 'Y' })).toBe(
      PLACE_POI_CATEGORIES.family,
    );
    expect(classifyOsmTags({ amenity: 'pub', name: 'Z' })).toBe(
      PLACE_POI_CATEGORIES.nightlife,
    );
    expect(classifyOsmTags({ leisure: 'golf_course', name: 'Links' })).toBe(
      PLACE_POI_CATEGORIES.outdoors,
    );
    expect(classifyOsmTags({ tourism: 'hotel', name: 'H' })).toBeNull();
    expect(buildOverpassQuery({ lat: 54.9, lon: -2.9 })).toContain('golf_course');
  });

  it('maps and caps Overpass elements', () => {
    const origin = { lat: 53.8, lon: -3.05 };
    const mapped = mapOverpassElement(
      {
        type: 'node',
        id: 1,
        lat: 53.81,
        lon: -3.04,
        tags: { name: 'Central Pier', tourism: 'attraction' },
      },
      origin,
    );
    expect(mapped?.category).toBe(PLACE_POI_CATEGORIES.attractions);
    expect(mapped?.name).toBe('Central Pier');

    const capped = capPlacePois(
      Array.from({ length: 30 }, (_, index) => ({
        category: PLACE_POI_CATEGORIES.restaurants,
        name: `Cafe ${index}`,
        lat: 53.8,
        lon: -3.05,
        distanceKm: index * 0.1,
        osmId: `node/${index}`,
        tags: {},
      })),
    );
    expect(capped.length).toBeLessThanOrEqual(12);
  });
});

describe('place article validation', () => {
  it('counts words and extracts H2s', () => {
    const html = '<h2>Weather outlook</h2><p>one two three</p>';
    expect(countWordsFromHtml(html)).toBe(5);
    expect(extractH2Texts(html)).toEqual(['Weather outlook']);
  });

  it('detects wikipedia paste', () => {
    const extract = 'Blackpool is a seaside resort town in Lancashire, England. '.repeat(5);
    expect(looksLikeSourcePaste(`<p>${extract}</p>`, extract)).toBe(true);
    expect(looksLikeSourcePaste('<p>Original Meridian copy about the pier.</p>', extract)).toBe(
      false,
    );
  });

  it('validates stub guide output as publishable', () => {
    const pack = {
      place: {
        slug: 'blackpool',
        name: 'Blackpool',
        adminArea: 'Lancashire',
        country: 'GB',
        lat: 53.8,
        lon: -3.05,
      },
      weather: { temp: 14, description: 'partly cloudy' },
      pois: {
        attractions: [{ name: 'Blackpool Tower' }],
        restaurants: [{ name: 'Harry\'s' }],
      },
      sources: [
        { title: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Blackpool', publisher: 'Wikipedia' },
        { title: 'OSM', url: 'https://www.openstreetmap.org', publisher: 'OpenStreetMap' },
        { title: 'Meridian', url: '/weather/blackpool', publisher: 'Meridian Weather' },
      ],
      wikipedia: { extract: 'Short extract only.' },
    };

    const draft = buildStubPlaceGuide(pack);
    const result = validatePlaceArticle({
      ...draft,
      placeSlug: 'blackpool',
      placeName: 'Blackpool',
      wikipediaExtract: pack.wikipedia.extract,
    });

    expect(result.wordCount).toBeGreaterThanOrEqual(PLACE_GUIDE_MIN_WORDS);
    expect(PLACE_GUIDE_REQUIRED_H2.every((h) => result.h2s.includes(h))).toBe(true);
    expect(result.ok).toBe(true);
  });
});

describe('place content repos', () => {
  it('stores and lists POIs, articles, and local links', () => {
    const slug = `test-place-${Date.now()}`;

    replacePlacePois(slug, [
      {
        category: PLACE_POI_CATEGORIES.outdoors,
        name: 'Promenade Park',
        lat: 53.8,
        lon: -3.05,
        osmId: 'way/1',
        tags: { leisure: 'park' },
      },
    ]);
    expect(countPlacePois(slug)).toBe(1);
    expect(listPlacePois(slug)[0].name).toBe('Promenade Park');
    const stored = listPlacePois(slug)[0];
    expect(getPlacePoi(slug, stored.id)?.name).toBe('Promenade Park');
    expect(getPlacePoi(slug, 'missing')).toBeNull();

    const article = upsertPlaceArticle({
      placeSlug: slug,
      slug: 'weather-weekend-planner',
      title: 'Test guide',
      excerpt: 'Excerpt',
      category: 'Weather planner',
      bodyHtml: '<p>Body</p>',
      wordCount: 1,
      status: PLACE_ARTICLE_STATUS.published,
      sources: [{ title: 'A', url: 'https://example.com', publisher: 'Ex' }],
      imageUrl: 'https://example.com/a.jpg',
      imageCredit: 'Example',
      imageSourceUrl: 'https://example.com',
    });

    expect(getPlaceArticle(slug, 'weather-weekend-planner')?.title).toBe('Test guide');
    expect(listPublishedPlaceArticles(slug)).toHaveLength(1);
    expect(article.href).toBe(`/weather/${slug}/guides/weather-weekend-planner`);

    replacePlaceLocalLinks(slug, [
      {
        title: 'Local story',
        url: 'https://news.example/story',
        publisher: 'Local Paper',
        publishedAt: new Date().toISOString(),
      },
    ]);
    expect(listPlaceLocalLinks(slug)).toHaveLength(1);
  });
});

describe('RSS parse', () => {
  it('parses outbound RSS items without bodies', () => {
    const xml = `
      <rss><channel>
        <item>
          <title>Blackpool lights update</title>
          <link>https://news.example/blackpool</link>
          <pubDate>Mon, 20 Jul 2026 10:00:00 GMT</pubDate>
          <source>Local Paper</source>
        </item>
      </channel></rss>
    `;
    const items = parseRssFromPipeline(xml);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Blackpool lights update');
    expect(items[0].url).toBe('https://news.example/blackpool');
    expect(items[0].body).toBeUndefined();
  });
});
