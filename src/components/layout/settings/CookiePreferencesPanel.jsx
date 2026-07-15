'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { DEFAULT_CONSENT } from '@/constants/monetization';
import { PreferenceToggle } from '@/components/layout/settings/PreferenceToggle';
import { useConsent } from '@/providers/ConsentProvider';

export function CookiePreferencesPanel({ draft, onDraftChange }) {
  const t = useTranslations('Cookie.preferences');
  const { consent } = useConsent();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{t('intro')}</p>

      <div className="flex flex-col gap-2">
        <div className="rounded-lg border border-border/70 bg-background/60 p-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">{t('essentialTitle')}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t('essentialDescription')}
              </p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">Always on</span>
          </div>
        </div>

        <PreferenceToggle
          id="cookie-functional"
          label={t('functionalTitle')}
          description={t('functionalDescription')}
          checked={draft.functional}
          onCheckedChange={(functional) => onDraftChange({ functional })}
        />

        <PreferenceToggle
          id="cookie-analytics"
          label={t('analyticsTitle')}
          description={t('analyticsDescription')}
          checked={draft.analytics}
          onCheckedChange={(analytics) => onDraftChange({ analytics })}
        />

        <PreferenceToggle
          id="cookie-advertising"
          label={t('advertisingTitle')}
          description={t('advertisingDescription')}
          checked={draft.advertising}
          onCheckedChange={(advertising) => onDraftChange({ advertising })}
        />

        <PreferenceToggle
          id="cookie-marketing"
          label={t('marketingTitle')}
          description={t('marketingDescription')}
          checked={draft.marketing}
          disabled
          onCheckedChange={() => {}}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Read our{' '}
        <Link href="/legal/cookies" className="underline">
          {t('cookiePolicy')}
        </Link>{' '}
        and{' '}
        <Link href="/legal/privacy" className="underline">
          {t('privacyPolicy')}
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
