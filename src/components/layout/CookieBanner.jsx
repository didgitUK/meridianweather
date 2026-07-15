'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { useHasMounted, useLocalStorageValue } from '@/hooks/use-browser-storage';
import { useConsent } from '@/providers/ConsentProvider';
import { useSettings } from '@/providers/SettingsProvider';
import {
  createAcceptedConsentDraft,
  createRejectedOptionalDraft,
} from '@/components/layout/settings/CookiePreferencesPanel';
import { SAFE_AREA, TOUCH } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function CookieBanner() {
  const t = useTranslations('Cookie.banner');
  const isMounted = useHasMounted();
  const cookieConsent = useLocalStorageValue(STORAGE_KEYS.cookieConsent);
  const { setConsent, acknowledgeCookieConsent } = useConsent();
  const { openSettings } = useSettings();

  if (!isMounted || cookieConsent === 'accepted') {
    return null;
  }

  function acceptNecessary() {
    acknowledgeCookieConsent();
    setConsent(createRejectedOptionalDraft());
  }

  function acceptAll() {
    acknowledgeCookieConsent();
    setConsent(createAcceptedConsentDraft({ advertising: true }));
  }

  function acceptFunctionalOnly() {
    acknowledgeCookieConsent();
    setConsent(createAcceptedConsentDraft());
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
      className={cn(
        'fixed left-4 right-4 z-40 mx-auto max-h-[min(70dvh,28rem)] w-auto max-w-sm overflow-y-auto rounded-xl border bg-card p-4 shadow-lg sm:left-auto sm:right-4 sm:w-[min(100vw-2rem,24rem)]',
        SAFE_AREA.bottom,
      )}
    >
      <p id="cookie-banner-title" className="text-sm font-medium">
        {t('title')}
      </p>
      <p id="cookie-banner-description" className="mt-2 text-sm text-muted-foreground">
        {t('descriptionBefore')}{' '}
        <Link href="/legal/cookies" className="underline">
          {t('cookiePolicy')}
        </Link>
        {t('descriptionAfter')}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Button className={TOUCH.minH} onClick={acceptAll}>{t('acceptAll')}</Button>
        <Button className={TOUCH.minH} variant="outline" onClick={acceptFunctionalOnly}>
          {t('acceptFunctional')}
        </Button>
        <Button className={TOUCH.minH} variant="outline" onClick={acceptNecessary}>
          {t('essentialOnly')}
        </Button>
        <Button className={TOUCH.minH} variant="ghost" onClick={() => openSettings('cookies')}>
          {t('managePreferences')}
        </Button>
      </div>
    </div>
  );
}
