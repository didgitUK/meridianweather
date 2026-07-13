import { DEFAULT_CONSENT, PRE_CHOICE_CONSENT } from '@/constants/monetization';
import { STORAGE_KEYS } from '@/constants/storage-keys';

export function readStoredConsentRaw() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(STORAGE_KEYS.consent) ?? '';
}

export function hasCookieConsentAcknowledged() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(STORAGE_KEYS.cookieConsent) === 'accepted';
}

export function parseStoredConsent(raw = readStoredConsentRaw()) {
  if (!raw) {
    return hasCookieConsentAcknowledged()
      ? { ...DEFAULT_CONSENT, functional: true, advertising: false }
      : PRE_CHOICE_CONSENT;
  }

  try {
    return { ...DEFAULT_CONSENT, ...JSON.parse(raw) };
  } catch {
    return PRE_CHOICE_CONSENT;
  }
}

export function isFunctionalConsentGranted(consent = parseStoredConsent()) {
  return Boolean(consent.functional);
}

export function clearFunctionalStorageData() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.weatherCache);
}
