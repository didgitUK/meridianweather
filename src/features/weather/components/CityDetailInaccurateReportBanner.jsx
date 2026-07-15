'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

export function CityDetailInaccurateReportBanner() {
  const t = useTranslations('CityDetail');

  return (
    <div
      role="status"
      className="rounded-lg border border-amber-200/90 bg-gradient-to-r from-amber-50 via-amber-50 to-amber-100/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:from-amber-950/50 dark:via-amber-950/35 dark:to-amber-900/25 dark:text-amber-50"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          {t('inaccurateBanner')}
        </p>
      </div>
    </div>
  );
}
