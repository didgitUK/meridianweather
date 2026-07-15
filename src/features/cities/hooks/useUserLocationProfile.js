'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useConsent } from '@/providers/ConsentProvider';
import { getCountryLabel } from '@/lib/geo/country-labels';
import {
  readUserLocationProfile,
  resolveEffectiveLocationProfile,
  saveUserLocationProfile,
  toGeocodeContext,
  writeUserLocationMeta,
} from '@/features/cities/utils/user-location-profile';

const UserLocationProfileContext = createContext(null);

function requestBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation unavailable'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      reject,
      {
        enableHighAccuracy: false,
        maximumAge: 15 * 60 * 1000,
        timeout: 8000,
      },
    );
  });
}

/** Shared across the app so Strict Mode remounts do not re-hit the region API. */
let regionHintPromise = null;
let autoGpsLock = false;

function loadRegionHintOnce() {
  if (!regionHintPromise) {
    regionHintPromise = fetch('/api/location/region')
      .then((response) => response.json())
      .then((payload) => payload?.region ?? null)
      .catch(() => null);
  }

  return regionHintPromise;
}

function useUserLocationProfileState() {
  const { consent } = useConsent();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gpsDenied, setGpsDenied] = useState(false);
  const autoGpsRequestedRef = useRef(false);

  const refreshProfile = useCallback(() => {
    setProfile(resolveEffectiveLocationProfile(readUserLocationProfile()));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setIsLoading(true);

      const region = await loadRegionHintOnce();
      if (!cancelled && region) {
        writeUserLocationMeta({ ipHint: region });
      }

      if (!cancelled) {
        refreshProfile();
        setIsLoading(false);
      }
    }

    bootstrap();

    const handleStorage = () => refreshProfile();
    window.addEventListener('meridian:storage', handleStorage);

    return () => {
      cancelled = true;
      window.removeEventListener('meridian:storage', handleStorage);
    };
  }, [refreshProfile]);

  const requestPreciseLocation = useCallback(async () => {
    if (!consent.functional) {
      setGpsDenied(true);
      return null;
    }

    try {
      const stored = readUserLocationProfile();
      const current = resolveEffectiveLocationProfile(stored);

      if (current?.source === 'confirmed') {
        setProfile(current);
        setGpsDenied(false);
        return current;
      }

      const position = await requestBrowserLocation();

      saveUserLocationProfile({
        ...stored,
        country: current?.country ?? null,
        label: current?.label ?? null,
        lat: position.lat,
        lon: position.lon,
        source: 'gps',
      });

      const resolved = resolveEffectiveLocationProfile(readUserLocationProfile());
      setProfile(resolved);
      setGpsDenied(false);
      return resolved;
    } catch {
      setGpsDenied(true);
      return null;
    }
  }, [consent.functional]);

  useEffect(() => {
    if (isLoading || !consent.functional || gpsDenied || autoGpsRequestedRef.current || autoGpsLock) {
      return;
    }

    const current = resolveEffectiveLocationProfile(readUserLocationProfile());
    if (current?.source === 'gps' || current?.source === 'confirmed') {
      return;
    }

    autoGpsRequestedRef.current = true;
    autoGpsLock = true;
    Promise.resolve().then(() => {
      void requestPreciseLocation();
    });
  }, [consent.functional, gpsDenied, isLoading, requestPreciseLocation]);

  const geocodeContext = useMemo(() => toGeocodeContext(profile), [profile]);

  let sourceLabel = null;
  if (profile?.source === 'confirmed') {
    sourceLabel = 'your saved home location';
  } else if (profile?.source === 'gps') {
    sourceLabel = 'precise device location';
  } else if (profile?.source === 'history') {
    sourceLabel = 'your recent checks';
  } else if (profile?.source === 'ip') {
    sourceLabel = 'approximate network location';
  }

  const displayLabel = profile?.label ?? getCountryLabel(profile?.country);

  return useMemo(() => ({
    profile,
    geocodeContext,
    displayLabel,
    sourceLabel,
    isLoading,
    gpsDenied,
    requestPreciseLocation,
    refreshProfile,
  }), [
    profile,
    geocodeContext,
    displayLabel,
    sourceLabel,
    isLoading,
    gpsDenied,
    requestPreciseLocation,
    refreshProfile,
  ]);
}

export function UserLocationProfileProvider({ children }) {
  const value = useUserLocationProfileState();
  return (
    <UserLocationProfileContext.Provider value={value}>
      {children}
    </UserLocationProfileContext.Provider>
  );
}

export function useUserLocationProfile() {
  const context = useContext(UserLocationProfileContext);
  if (!context) {
    throw new Error('useUserLocationProfile requires UserLocationProfileProvider');
  }
  return context;
}
