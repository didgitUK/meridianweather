'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { DEFAULT_ACCESSIBILITY_PREFERENCES } from '@/constants/accessibility';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import {
  applyAccessibilityDocumentState,
  parseAccessibilityPreferences,
  resolveReducedMotionPreference,
} from '@/lib/accessibility-preferences';
import { useHasMounted, writeLocalStorageValue } from '@/hooks/use-browser-storage';
import { useTheme } from '@/providers/ThemeProvider';

const AccessibilityContext = createContext({
  preferences: DEFAULT_ACCESSIBILITY_PREFERENCES,
  setPreferences: () => {},
  reducedMotion: false,
});

function subscribe(onStoreChange) {
  const handler = () => onStoreChange();
  window.addEventListener('meridian:storage', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('meridian:storage', handler);
    window.removeEventListener('storage', handler);
  };
}

function readAccessibilityRaw() {
  return window.localStorage.getItem(STORAGE_KEYS.accessibility) ?? '';
}

export function AccessibilityProvider({ children }) {
  const isMounted = useHasMounted();
  const { resolvedTheme } = useTheme();
  const raw = useSyncExternalStore(subscribe, readAccessibilityRaw, () => '');
  const preferences = useMemo(() => parseAccessibilityPreferences(raw), [raw]);

  const reducedMotion = useMemo(
    () => resolveReducedMotionPreference(preferences),
    [preferences],
  );

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    applyAccessibilityDocumentState({
      preferences,
      resolvedTheme,
    });
  }, [isMounted, preferences, resolvedTheme]);

  const setPreferences = useCallback(
    (nextPreferences) => {
      const merged = { ...preferences, ...nextPreferences };
      writeLocalStorageValue(STORAGE_KEYS.accessibility, JSON.stringify(merged));
    },
    [preferences],
  );

  const value = useMemo(
    () => ({
      preferences: isMounted ? preferences : DEFAULT_ACCESSIBILITY_PREFERENCES,
      setPreferences,
      reducedMotion: isMounted ? reducedMotion : false,
    }),
    [isMounted, preferences, reducedMotion, setPreferences],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
