'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DEFAULT_ACCESSIBILITY_PREFERENCES } from '@/constants/accessibility';
import {
  AccessibilityPreferencesPanel,
} from '@/components/layout/settings/AccessibilityPreferencesPanel';
import { AppInstallPanel } from '@/components/layout/settings/AppInstallPanel';
import {
  CookiePreferencesPanel,
  createAcceptedConsentDraft,
  createRejectedOptionalDraft,
} from '@/components/layout/settings/CookiePreferencesPanel';
import { AdFreePlansPanel } from '@/components/monetization/AdFreePlansPanel';
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

  if (activeTab === 'adFree') {
    return <AdFreePlansPanel />;
  }

  if (activeTab === 'app') {
    return <AppInstallPanel />;
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
  onResetAccessibility,
}) {
  const tCookie = useTranslations('Cookie.preferences');
  const tA11y = useTranslations('Settings.accessibility');

  if (activeTab === 'adFree' || activeTab === 'app') {
    return null;
  }

  if (activeTab === 'cookies') {
    return (
      <>
        <Button type="button" className="w-full sm:w-auto" onClick={() => onSaveCookies(cookieDraft)}>
          {tCookie('savePreferences')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => onSaveCookies(createAcceptedConsentDraft({ advertising: true }))}
        >
          {tCookie('acceptAll')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          onClick={() => onSaveCookies(createRejectedOptionalDraft())}
        >
          {tCookie('rejectNonEssential')}
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        type="button"
        className="w-full sm:w-auto"
        onClick={() => onSaveAccessibility(accessibilityDraft)}
      >
        {tA11y('save')}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        onClick={onResetAccessibility}
      >
        {tA11y('reset')}
      </Button>
    </>
  );
}

export function SettingsSheet({ open, onOpenChange, initialTab = 'cookies' }) {
  const t = useTranslations('Settings');
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
        <SheetHeader className="shrink-0 items-start gap-2 border-b border-border/60 pb-4 text-left">
          <SettingsSheetBrand />
          <SheetTitle className="font-heading text-left">{t('title')}</SheetTitle>
          <SheetDescription className="text-left">{t('description')}</SheetDescription>
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
