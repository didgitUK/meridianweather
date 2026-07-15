import { describe, expect, it } from 'vitest';
import {
  EMAIL_TEMPLATE_DEFINITIONS,
  EMAIL_TEMPLATE_SLUGS,
  resolveWeatherAlertTemplateSlug,
  weatherAlertTemplateSlug,
} from '@/constants/email-templates';
import {
  alertMailingListId,
  getMailingListMeta,
  parseMailingListId,
  templateSlugForMailingList,
} from '@/constants/mailing-lists';
import { ALL_ALERT_TYPES } from '@/constants/alert-types';

describe('resolveWeatherAlertTemplateSlug', () => {
  it('returns shared fallback when alert type is missing', () => {
    expect(resolveWeatherAlertTemplateSlug()).toBe(EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT);
    expect(resolveWeatherAlertTemplateSlug('')).toBe(EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT);
    expect(resolveWeatherAlertTemplateSlug('not-a-type')).toBe(EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT);
  });

  it('returns per-type slug for known alert types', () => {
    expect(resolveWeatherAlertTemplateSlug('rain')).toBe('weather-alert-rain');
    expect(resolveWeatherAlertTemplateSlug('tornado_warning')).toBe(
      weatherAlertTemplateSlug('tornado_warning'),
    );
  });
});

describe('email template definitions', () => {
  it('includes welcome, weekly digest, fallback alert, and every alert type', () => {
    const slugs = new Set(EMAIL_TEMPLATE_DEFINITIONS.map((item) => item.slug));

    expect(slugs.has(EMAIL_TEMPLATE_SLUGS.WELCOME)).toBe(true);
    expect(slugs.has(EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST)).toBe(true);
    expect(slugs.has(EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT)).toBe(true);

    for (const type of ALL_ALERT_TYPES) {
      expect(slugs.has(weatherAlertTemplateSlug(type.id))).toBe(true);
    }
  });
});

describe('mailing list helpers', () => {
  it('parses top-level and alert list ids', () => {
    expect(parseMailingListId('newsletter')).toEqual({ kind: 'newsletter' });
    expect(parseMailingListId('weekly-digest')).toEqual({ kind: 'weekly' });
    expect(parseMailingListId(alertMailingListId('rain'))).toEqual({
      kind: 'alert',
      alertTypeId: 'rain',
    });
    expect(parseMailingListId('alert:nope')).toBeNull();
  });

  it('maps list ids to template slugs', () => {
    expect(templateSlugForMailingList('newsletter')).toBe(EMAIL_TEMPLATE_SLUGS.WELCOME);
    expect(templateSlugForMailingList('weekly-digest')).toBe(EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST);
    expect(templateSlugForMailingList(alertMailingListId('fog'))).toBe('weather-alert-fog');
  });

  it('builds alert list metadata with source', () => {
    const meta = getMailingListMeta(alertMailingListId('rain'));
    expect(meta?.label).toBe('Rain');
    expect(meta?.source).toBe('openweather');
    expect(meta?.templateSlug).toBe('weather-alert-rain');
    expect(meta?.description).toMatch(/location/i);
    expect(meta?.description).not.toMatch(/city alert/i);
  });
});
