import { describe, expect, it } from 'vitest';
import {
  normalizeOpenWeatherLang,
  resolveOpenWeatherLang,
} from '@/i18n/locales';
import { getPolicyBySlug, getDocBySlug } from '@/lib/cms/get-cms-content';
import { getBlogPostById } from '@/constants/blog-posts';

describe('public i18n locale resolution', () => {
  it('maps UI locales to OpenWeather langs and rejects unknown langs', () => {
    expect(resolveOpenWeatherLang('de')).toBe('de');
    expect(resolveOpenWeatherLang('en-GB')).toBe('en');
    expect(normalizeOpenWeatherLang('fr')).toBe('fr');
    expect(normalizeOpenWeatherLang('zz')).toBeNull();
  });

  it('returns localized legal and docs for non-English locales', () => {
    const termsDe = getPolicyBySlug('terms', 'de');
    expect(termsDe?.slug).toBe('terms');
    expect(termsDe?.title).not.toBe('Terms of Use');

    const docEs = getDocBySlug('getting-started', 'es');
    expect(docEs?.slug).toBe('getting-started');
    expect(docEs?.title).not.toBe('Getting started');
  });

  it('keeps English legal/docs resolution for en and en-GB', () => {
    const termsEn = getPolicyBySlug('terms', 'en');
    expect(termsEn?.title).toBe('Terms of Use');

    const termsGb = getPolicyBySlug('terms', 'en-GB');
    expect(termsGb?.title).toBe('Terms of Use');
  });

  it('returns localized journal posts for non-English locales', () => {
    const post = getBlogPostById('reading-hourly-forecasts', 'de');
    expect(post?.id).toBe('reading-hourly-forecasts');
    expect(post?.title).not.toMatch(/How to read an hourly forecast/);
  });
});
