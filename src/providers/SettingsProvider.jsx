'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { FloatingControlsDock } from '@/components/layout/settings/FloatingControlsDock';
import { SettingsSheet } from '@/components/layout/settings/SettingsSheet';

const SettingsContext = createContext({
  openSettings: () => {},
  openPrivacyPreferences: () => {},
  isSettingsOpen: false,
});

export function SettingsProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [initialTab, setInitialTab] = useState('cookies');
  const [sheetKey, setSheetKey] = useState(0);

  const openSettings = useCallback((tab) => {
    setInitialTab(tab ?? 'cookies');
    setSheetKey((current) => current + 1);
    setOpen(true);
  }, []);

  const openPrivacyPreferences = useCallback(() => {
    openSettings('cookies');
  }, [openSettings]);

  const value = useMemo(
    () => ({
      openSettings,
      openPrivacyPreferences,
      isSettingsOpen: open,
    }),
    [openPrivacyPreferences, openSettings, open],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
      <FloatingControlsDock onOpenSettings={() => openSettings()} />
      <SettingsSheet key={sheetKey} open={open} onOpenChange={setOpen} initialTab={initialTab} />
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

export function usePrivacyPreferences() {
  const { openPrivacyPreferences } = useSettings();
  return { openPrivacyPreferences };
}
