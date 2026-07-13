'use client';

import { useState } from 'react';
import { DEFAULT_ACCESSIBILITY_PREFERENCES } from '@/constants/accessibility';
import {
  AccessibilityPreferencesPanel,
} from '@/components/layout/settings/AccessibilityPreferencesPanel';
import {
  CookiePreferencesPanel,
  createAcceptedConsentDraft,
  createRejectedOptionalDraft,
} from '@/components/layout/settings/CookiePreferencesPanel';
import { WeatherPreferencesPanel } from '@/components/layout/settings/WeatherPreferencesPanel';
import { SettingsSheetBrand } from '@/components/layout/settings/SettingsSheetBrand';
import { SettingsTabList } from '@/components/layout/settings/SettingsTabList';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useConsent } from '@/providers/ConsentProvider';

function SettingsPanel({ activeTab, cookieDraft, setCookieDraft, accessibilityDraft, setAccessibilityDraft }) {
  if (activeTab === 'cookies') {
    return (
      <CookiePreferencesPanel
        draft={cookieDraft}
        onDraftChange={(partial) => setCookieDraft((current) => ({ ...current, ...partial }))}
      />
    );
  }

  if (activeTab === 'weather') {
    return <WeatherPreferencesPanel />;
  }

  return (
    <AccessibilityPreferencesPanel
      draft={accessibilityDraft}
      onDraftChange={(partial) =>
        setAccessibilityDraft((current) => ({ ...current, ...partial }))
      }
    />
  );
}

function SettingsFooterActions({
  activeTab,
  cookieDraft,
  accessibilityDraft,
  onSaveCookies,
  onSaveAccessibility,
  onClose,
  onResetAccessibility,
}) {
  if (activeTab === 'cookies') {
    return (
      <>
        <Button type="button" className="w-full sm:w-auto" onClick={() => onSaveCookies(cookieDraft)}>
          Save cookie preferences
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => onSaveCookies(createAcceptedConsentDraft({ advertising: true }))}
        >
          Accept all
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          onClick={() => onSaveCookies(createRejectedOptionalDraft())}
        >
          Reject non-essential
        </Button>
      </>
    );
  }

  if (activeTab === 'weather') {
    return (
      <Button type="button" className="w-full sm:w-auto" onClick={onClose}>
        Done
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        className="w-full sm:w-auto"
        onClick={() => onSaveAccessibility(accessibilityDraft)}
      >
        Save accessibility settings
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        onClick={onResetAccessibility}
      >
        Reset to defaults
      </Button>
    </>
  );
}

export function SettingsSheet({ open, onOpenChange, initialTab = 'cookies' }) {
  const { consent, setConsent, acknowledgeCookieConsent } = useConsent();
  const { preferences, setPreferences } = useAccessibility();
  const { setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [cookieDraft, setCookieDraft] = useState(consent);
  const [accessibilityDraft, setAccessibilityDraft] = useState(preferences);

  function closeSheet() {
    onOpenChange(false);
  }

  function saveCookiePreferences(nextConsent) {
    acknowledgeCookieConsent();
    setConsent(nextConsent);
    closeSheet();
  }

  function saveAccessibilityPreferences(nextPreferences) {
    setPreferences(nextPreferences);
    closeSheet();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-full max-w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="shrink-0 gap-2 border-b border-border/60 pb-4">
          <SettingsSheetBrand />
          <SheetTitle className="font-heading">Settings</SheetTitle>
          <SheetDescription>
            Manage cookies, weather refresh, and accessibility options for meridian on this device.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          <SettingsTabList value={activeTab} onChange={setActiveTab} />

          <div
            role="tabpanel"
            id={`settings-panel-${activeTab}`}
            aria-labelledby={`settings-tab-${activeTab}`}
          >
            <SettingsPanel
              activeTab={activeTab}
              cookieDraft={cookieDraft}
              setCookieDraft={setCookieDraft}
              accessibilityDraft={accessibilityDraft}
              setAccessibilityDraft={setAccessibilityDraft}
            />
          </div>
        </div>

        <SheetFooter className="shrink-0 border-t border-border/60 [&_button]:min-h-touch">
          <SettingsFooterActions
            activeTab={activeTab}
            cookieDraft={cookieDraft}
            accessibilityDraft={accessibilityDraft}
            onSaveCookies={saveCookiePreferences}
            onSaveAccessibility={saveAccessibilityPreferences}
            onClose={closeSheet}
            onResetAccessibility={() => {
              setTheme('system');
              saveAccessibilityPreferences(DEFAULT_ACCESSIBILITY_PREFERENCES);
            }}
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
