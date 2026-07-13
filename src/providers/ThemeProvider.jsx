'use client';

import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { resolveColorSchemePreference } from '@/lib/accessibility-preferences';
import { useHasMounted, writeLocalStorageValue } from '@/hooks/use-browser-storage';

const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
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

function readTheme() {
  const stored = window.localStorage.getItem(STORAGE_KEYS.theme);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }

  return 'system';
}

export function ThemeProvider({ children }) {
  const isMounted = useHasMounted();
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'system');
  const resolvedTheme = useMemo(
    () => resolveColorSchemePreference(theme),
    [theme],
  );

  const value = useMemo(
    () => ({
      theme: isMounted ? theme : 'system',
      resolvedTheme: isMounted ? resolvedTheme : 'light',
      setTheme: (nextTheme) => writeLocalStorageValue(STORAGE_KEYS.theme, nextTheme),
    }),
    [isMounted, resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
