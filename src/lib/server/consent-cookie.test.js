import { afterEach, describe, expect, it } from 'vitest';
import {
  createConsentCookieValue,
  isSameOriginRequest,
  parseConsentCookieValue,
} from '@/lib/server/consent-cookie';

describe('consent-cookie', () => {
  const previousSecret = process.env.ADMIN_SECRET;
  const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    if (previousSecret === undefined) {
      delete process.env.ADMIN_SECRET;
    } else {
      process.env.ADMIN_SECRET = previousSecret;
    }
    if (previousAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
    }
  });

  it('round-trips signed consent flags', () => {
    process.env.ADMIN_SECRET = 'test-consent-secret';
    const token = createConsentCookieValue({ analytics: true, advertising: false });
    expect(token).toBeTruthy();
    expect(parseConsentCookieValue(token)).toEqual({
      analytics: true,
      advertising: false,
    });
  });

  it('rejects tampered tokens', () => {
    process.env.ADMIN_SECRET = 'test-consent-secret';
    const token = createConsentCookieValue({ analytics: true, advertising: true });
    const [payload] = token.split('.');
    expect(parseConsentCookieValue(`${payload}.deadbeef`)).toBeNull();
  });

  it('accepts same-origin analytics requests', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://meridianweather.co.uk';
    const request = new Request('https://meridianweather.co.uk/api/analytics/collect', {
      method: 'POST',
      headers: { origin: 'https://meridianweather.co.uk' },
    });
    expect(isSameOriginRequest(request)).toBe(true);
  });

  it('rejects cross-origin analytics requests', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://meridianweather.co.uk';
    const request = new Request('https://meridianweather.co.uk/api/analytics/collect', {
      method: 'POST',
      headers: { origin: 'https://evil.example' },
    });
    expect(isSameOriginRequest(request)).toBe(false);
  });
});
