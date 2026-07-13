'use client';

import { Link } from '@/i18n/navigation';
import { DEFAULT_CONSENT } from '@/constants/monetization';
import { PreferenceToggle } from '@/components/layout/settings/PreferenceToggle';
import { useConsent } from '@/providers/ConsentProvider';

export function CookiePreferencesPanel({ draft, onDraftChange }) {
  const { consent } = useConsent();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Choose which optional storage and scripts meridian may use. Essential features such as saved
        cities and theme always remain enabled.
      </p>

      <div className="flex flex-col gap-2">
        <div className="rounded-lg border border-border/70 bg-background/60 p-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Essential</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Saved cities, client ID, theme, and core app state required to run meridian.
              </p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">Always on</span>
          </div>
        </div>

        <PreferenceToggle
          id="cookie-functional"
          label="Functional"
          description="Weather cache for faster loads and optional precise device location for search ranking."
          checked={draft.functional}
          onCheckedChange={(functional) => onDraftChange({ functional })}
        />

        <PreferenceToggle
          id="cookie-analytics"
          label="Analytics"
          description="Reserved for anonymous usage insights. Enabled only when you opt in."
          checked={draft.analytics}
          onCheckedChange={(analytics) => onDraftChange({ analytics })}
        />

        <PreferenceToggle
          id="cookie-advertising"
          label="Advertising"
          description="Google AdSense on the free tier. Google may set third-party cookies when enabled."
          checked={draft.advertising}
          onCheckedChange={(advertising) => onDraftChange({ advertising })}
        />

        <PreferenceToggle
          id="cookie-marketing"
          label="Marketing"
          description="Reserved for future promotional communications. Not used in v1."
          checked={draft.marketing}
          disabled
          onCheckedChange={() => {}}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Read our{' '}
        <Link href="/legal/cookies" className="underline">
          Cookie Policy
        </Link>{' '}
        and{' '}
        <Link href="/legal/privacy" className="underline">
          Privacy Policy
        </Link>
        . Current saved consent: functional {consent.functional ? 'on' : 'off'}, advertising{' '}
        {consent.advertising ? 'on' : 'off'}.
      </p>
    </div>
  );
}

export function createAcceptedConsentDraft(overrides = {}) {
  return {
    ...DEFAULT_CONSENT,
    functional: true,
    advertising: false,
    ...overrides,
  };
}

export function createRejectedOptionalDraft() {
  return {
    ...DEFAULT_CONSENT,
    functional: false,
    advertising: false,
    analytics: false,
    marketing: false,
  };
}
