'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { TOUCH } from '@/constants/design-tokens';
import { useHasMounted, useLocalStorageValue, writeLocalStorageValue } from '@/hooks/use-browser-storage';
import { useSettings } from '@/providers/SettingsProvider';
import { usePwaInstallPrompt } from '@/features/pwa/usePwaInstallPrompt';
import { cn } from '@/lib/utils';

const BANNER_ABOVE_MOBILE_NAV =
  'bottom-[calc(var(--mobile-nav-offset,0px)+0.75rem)] md:bottom-[calc(3.75rem+var(--safe-area-inset-bottom,0px))]';

/**
 * One-time install discovery nudge (not shown when already installed or dismissed).
 */
export function PwaInstallNudge() {
  const t = useTranslations('Pwa.installNudge');
  const isMounted = useHasMounted();
  const cookieConsent = useLocalStorageValue(STORAGE_KEYS.cookieConsent);
  const dismissed = useLocalStorageValue(STORAGE_KEYS.pwaInstallNudgeDismissed);
  const { openSettings } = useSettings();
  const { canPromptInstall, showIosHint, isInstalled, promptInstall } = usePwaInstallPrompt();
  const [delayElapsed, setDelayElapsed] = useState(false);

  const eligible = Boolean(
    isMounted
    && cookieConsent === 'accepted'
    && dismissed !== '1'
    && !isInstalled
    && (canPromptInstall || showIosHint),
  );

  useEffect(() => {
    if (!eligible) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setDelayElapsed(true);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [eligible]);

  const visible = eligible && delayElapsed;

  if (!visible) {
    return null;
  }

  function dismiss() {
    writeLocalStorageValue(STORAGE_KEYS.pwaInstallNudgeDismissed, '1');
    setDelayElapsed(false);
  }

  async function handleInstall() {
    if (canPromptInstall) {
      const result = await promptInstall();
      if (result.outcome === 'accepted') {
        dismiss();
        return;
      }
    }
    openSettings('app');
    dismiss();
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed right-4 z-30 w-[min(100vw-2rem,20rem)] rounded-xl border bg-card p-3 shadow-lg',
        BANNER_ABOVE_MOBILE_NAV,
      )}
    >
      <p className="text-sm font-medium text-foreground">{t('title')}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {showIosHint ? t('iosBody') : t('body')}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" className={cn(TOUCH.minH, 'gap-1.5')} onClick={handleInstall}>
          <Download className="size-3.5" aria-hidden />
          {canPromptInstall ? t('install') : t('howTo')}
        </Button>
        <Button type="button" size="sm" variant="ghost" className={TOUCH.minH} onClick={dismiss}>
          {t('dismiss')}
        </Button>
      </div>
    </div>
  );
}
