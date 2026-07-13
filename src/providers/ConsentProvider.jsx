'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { DEFAULT_CONSENT, TIERS } from '@/constants/monetization';
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
  consent: DEFAULT_CONSENT,
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

export function ConsentProvider({ children }) {
  const isMounted = useHasMounted();
  const consentRaw = useSyncExternalStore(subscribe, readConsentSnapshot, () => '');
  const consent = useMemo(() => parseStoredConsent(consentRaw), [consentRaw]);

  const setConsent = useCallback(
    (nextConsent) => {
      const merged = { ...consent, ...nextConsent, essential: true };
      writeLocalStorageValue(STORAGE_KEYS.consent, JSON.stringify(merged));

      if (!merged.functional) {
        clearFunctionalStorageData();
        clearPreciseLocationFromProfile();
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
      consent: isMounted ? consent : DEFAULT_CONSENT,
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
