'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { PRE_CHOICE_CONSENT, TIERS } from '@/constants/monetization';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import {
  clearFunctionalStorageData,
  parseStoredConsent,
  readStoredConsentRaw,
} from '@/lib/consent-storage';
import { useHasMounted, writeLocalStorageValue } from '@/hooks/use-browser-storage';
import { clearPreciseLocationFromProfile } from '@/features/cities/utils/user-location-profile';

const ConsentContext = createContext({
  tier: TIERS.FREE,
  consent: PRE_CHOICE_CONSENT,
  setConsent: () => {},
  acknowledgeCookieConsent: () => {},
});

function subscribe(onStoreChange) {
  const handler = () => onStoreChange();
  window.addEventListener('meridian:storage', handler);
  return () => window.removeEventListener('meridian:storage', handler);
}

function readConsentSnapshot() {
  return readStoredConsentRaw();
}

function syncConsentCookie(nextConsent) {
  const analytics = Boolean(nextConsent?.analytics);
  const advertising = Boolean(nextConsent?.advertising);

  if (!analytics && !advertising) {
    void fetch('/api/consent', { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
    return;
  }

  void fetch('/api/consent', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analytics, advertising }),
  }).catch(() => {});
}

export function ConsentProvider({ children }) {
  const isMounted = useHasMounted();
  const consentRaw = useSyncExternalStore(subscribe, readConsentSnapshot, () => '');
  const consent = useMemo(() => parseStoredConsent(consentRaw), [consentRaw]);
  const previousTrackingRef = useRef({ analytics: false, advertising: false });
  const syncedCookieRef = useRef(false);

  useEffect(() => {
    if (!isMounted || syncedCookieRef.current) {
      return;
    }
    syncedCookieRef.current = true;
    if (consent.analytics || consent.advertising) {
      syncConsentCookie(consent);
    }
  }, [consent, isMounted]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    previousTrackingRef.current = {
      analytics: Boolean(consent.analytics),
      advertising: Boolean(consent.advertising),
    };
  }, [consent.analytics, consent.advertising, isMounted]);

  const setConsent = useCallback(
    (nextConsent) => {
      const merged = { ...consent, ...nextConsent, essential: true };
      writeLocalStorageValue(STORAGE_KEYS.consent, JSON.stringify(merged));
      syncConsentCookie(merged);

      if (!merged.functional) {
        clearFunctionalStorageData();
        clearPreciseLocationFromProfile();
      }

      const prev = previousTrackingRef.current;
      const revokedTracking =
        (prev.analytics && !merged.analytics)
        || (prev.advertising && !merged.advertising);
      previousTrackingRef.current = {
        analytics: Boolean(merged.analytics),
        advertising: Boolean(merged.advertising),
      };

      if (revokedTracking && typeof window !== 'undefined') {
        window.setTimeout(() => {
          window.location.reload();
        }, 50);
      }
    },
    [consent],
  );

  const acknowledgeCookieConsent = useCallback(() => {
    writeLocalStorageValue(STORAGE_KEYS.cookieConsent, 'accepted');
  }, []);

  const value = useMemo(
    () => ({
      tier: TIERS.FREE,
      consent: isMounted ? consent : PRE_CHOICE_CONSENT,
      setConsent,
      acknowledgeCookieConsent,
    }),
    [acknowledgeCookieConsent, consent, isMounted, setConsent],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  return useContext(ConsentContext);
}
