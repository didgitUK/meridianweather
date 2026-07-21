'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { usePwaInstallPrompt } from '@/features/pwa/usePwaInstallPrompt';

/**
 * Footer install CTA — PWA only (no fake App Store / Play badges).
 */
export function FooterAppDownloads() {
  const t = useTranslations('Footer');
  const { canPromptInstall, showIosHint, isInstalled, promptInstall } = usePwaInstallPrompt();

  if (isInstalled) {
    return (
      <p className="text-sm text-header-fg/80">{t('appInstalled')}</p>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-sm text-header-fg/80">{t('installHint')}</p>
      {canPromptInstall ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            void promptInstall();
          }}
        >
          {t('installCta')}
        </Button>
      ) : null}
      {showIosHint ? (
        <p className="text-xs text-header-fg/70">{t('iosInstallHint')}</p>
      ) : null}
      {!canPromptInstall && !showIosHint ? (
        <p className="text-xs text-header-fg/70">{t('installUnavailable')}</p>
      ) : null}
    </div>
  );
}
