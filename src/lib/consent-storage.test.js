import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { DEFAULT_CONSENT, PRE_CHOICE_CONSENT } from '@/constants/monetization';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import {
  hasCookieConsentAcknowledged,
  isFunctionalConsentGranted,
  parseStoredConsent,
} from '@/lib/consent-storage';

describe('consent-storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: {
        store: new Map(),
        getItem(key) {
          return this.store.get(key) ?? null;
        },
        setItem(key, value) {
          this.store.set(key, value);
        },
        removeItem(key) {
          this.store.delete(key);
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns pre-choice consent before acknowledgement', () => {
    expect(parseStoredConsent()).toEqual(PRE_CHOICE_CONSENT);
    expect(hasCookieConsentAcknowledged()).toBe(false);
    expect(isFunctionalConsentGranted()).toBe(false);
  });

  it('returns functional consent after legacy acknowledgement without json', () => {
    window.localStorage.setItem(STORAGE_KEYS.cookieConsent, 'accepted');

    expect(parseStoredConsent()).toEqual({
      ...DEFAULT_CONSENT,
      functional: true,
      advertising: false,
    });
    expect(isFunctionalConsentGranted()).toBe(true);
  });

  it('merges stored consent json', () => {
    window.localStorage.setItem(
      STORAGE_KEYS.consent,
      JSON.stringify({ functional: false, advertising: true }),
    );

    expect(parseStoredConsent()).toEqual({
      ...DEFAULT_CONSENT,
      functional: false,
      advertising: true,
    });
  });
});
