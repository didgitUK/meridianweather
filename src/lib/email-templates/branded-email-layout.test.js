import { describe, expect, it } from 'vitest';
import { ALL_ALERT_TYPES } from '@/constants/alert-types';
import { EMAIL_TEMPLATE_SLUGS, weatherAlertTemplateSlug } from '@/constants/email-template-slugs';
import {
  EMAIL_LAYOUT_MARKER,
  EMAIL_LAYOUT_VERSION,
  getAlertEmailTheme,
  getEmailTemplateTheme,
} from '@/constants/email-template-themes';
import {
  buildAuthInviteEmailHtml,
  buildBrandedEmailHtml,
  buildWeatherAlertEmailHtml,
  buildWelcomeEmailHtml,
  buildWeeklyDigestEmailHtml,
} from '@/lib/email-templates/branded-email-layout';

describe('email template themes', () => {
  it(`marks layout version ${EMAIL_LAYOUT_VERSION}`, () => {
    expect(EMAIL_LAYOUT_MARKER).toContain(`meridian-email-layout:${EMAIL_LAYOUT_VERSION}`);
  });

  it('gives every alert type a unique eyebrow and accent', () => {
    const eyebrows = new Set();
    const accents = new Set();

    for (const type of ALL_ALERT_TYPES) {
      const theme = getAlertEmailTheme(type);
      expect(theme.eyebrow.length).toBeGreaterThan(0);
      expect(theme.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.imageMode).toBe('hero');
      expect(theme.leadHtml).toContain('{{cityName}}');
      eyebrows.add(theme.eyebrow);
      accents.add(`${type.id}:${theme.accentColor}`);
    }

    expect(eyebrows.size).toBe(ALL_ALERT_TYPES.length);
    expect(accents.size).toBe(ALL_ALERT_TYPES.length);
  });

  it('themes non-alert mailing and auth slugs', () => {
    expect(getEmailTemplateTheme(EMAIL_TEMPLATE_SLUGS.WELCOME).eyebrow).toBe('Welcome');
    expect(getEmailTemplateTheme(EMAIL_TEMPLATE_SLUGS.ADMIN_INVITE).imageMode).toBe('brand');
    expect(getEmailTemplateTheme(weatherAlertTemplateSlug('rain')).eyebrow).toBe('Rain alert');
  });
});

describe('branded email layout', () => {
  it('always includes black header logo and layout marker', () => {
    const html = buildBrandedEmailHtml({
      title: 'Test',
      preview: 'Preview',
      eyebrow: 'Eyebrow',
      accentColor: '#2563eb',
      bodyHtml: '<p>Body</p>',
      footerHtml: '<p>Footer</p>',
    });

    expect(html).toContain(EMAIL_LAYOUT_MARKER);
    expect(html).toContain('background-color:#000000');
    expect(html).toContain('{{logoUrl}}');
    expect(html).toContain('Eyebrow');
    expect(html).toContain('#2563eb');
  });

  it('builds distinct weather alert HTML per type', () => {
    const rain = buildWeatherAlertEmailHtml({ id: 'rain', label: 'Rain' });
    const tornado = buildWeatherAlertEmailHtml({ id: 'tornado_emergency', label: 'Tornado emergency' });

    expect(rain).toContain('Rain alert');
    expect(tornado).toContain('Tornado emergency');
    expect(rain).not.toBe(tornado);
    expect(rain).toContain('{{heroImageUrl}}');
    expect(rain).toContain('{{currentCardHtml}}');
    expect(rain).toContain('{{dailyForecastHtml}}');
    expect(rain).toContain('{{unsubscribeUrl}}');
    expect(tornado).toContain('#dc2626');
  });

  it('brands welcome and digest with unsubscribe footers', () => {
    const welcome = buildWelcomeEmailHtml();
    const digest = buildWeeklyDigestEmailHtml();

    expect(welcome).toContain(EMAIL_LAYOUT_MARKER);
    expect(welcome).toContain('{{unsubscribeUrl}}');
    expect(digest).toContain('{{locationsHtml}}');
    expect(digest).toContain('{{unsubscribeUrl}}');
  });

  it('brands auth invite with CTA and logo', () => {
    const invite = buildAuthInviteEmailHtml();
    expect(invite).toContain('{{inviteUrl}}');
    expect(invite).toContain('{{logoUrl}}');
    expect(invite).toContain('Accept invitation');
  });
});
