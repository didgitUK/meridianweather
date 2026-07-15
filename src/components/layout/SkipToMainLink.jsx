'use client';

import { useTranslations } from 'next-intl';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { cn } from '@/lib/utils';

export function SkipToMainLink() {
  const t = useTranslations('Common');
  const { preferences } = useAccessibility();

  if (!preferences.showSkipLink) {
    return null;
  }

  return (
    <a
      href="#main-content"
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60]',
        'focus:rounded-lg focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2',
        'focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
      )}
    >
      {t('skipToMainContent')}
    </a>
  );
}
