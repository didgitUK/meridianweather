import { describe, expect, it } from 'vitest';
import { ROBOTS_INDEX, ROBOTS_NOINDEX } from '@/lib/seo';
import {
  isDocsNoindexSlug,
  isSearchIndexLocale,
  resolveRobots,
  shouldNoindexWeatherPlace,
} from '@/lib/seo-indexability';

describe('seo-indexability', () => {
  it('limits search-index locales to English variants', () => {
    expect(isSearchIndexLocale('en')).toBe(true);
    expect(isSearchIndexLocale('en-GB')).toBe(true);
    expect(isSearchIndexLocale('de')).toBe(false);
  });

  it('marks operator docs as noindex', () => {
    expect(isDocsNoindexSlug('deployment')).toBe(true);
    expect(isDocsNoindexSlug('getting-started')).toBe(false);
  });

  it('noindexes cold / geocode tier places', () => {
    expect(shouldNoindexWeatherPlace({ tier: 1 })).toBe(false);
    expect(shouldNoindexWeatherPlace({ tier: 2 })).toBe(false);
    expect(shouldNoindexWeatherPlace({ tier: 3 })).toBe(true);
    expect(shouldNoindexWeatherPlace({})).toBe(true);
  });

  it('resolves robots from locale + flags', () => {
    expect(resolveRobots({ locale: 'en' })).toEqual(ROBOTS_INDEX);
    expect(resolveRobots({ locale: 'fr' })).toEqual(ROBOTS_NOINDEX);
    expect(resolveRobots({ locale: 'en', noindex: true })).toEqual(ROBOTS_NOINDEX);
  });
});
