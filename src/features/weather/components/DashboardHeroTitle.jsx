'use client';

import { useTranslations } from 'next-intl';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function DashboardHeroTitle() {
  const t = useTranslations('Brand');

  return (
    <h1 className={cn(TYPOGRAPHY.display, TYPOGRAPHY.heading, 'tracking-tight text-foreground')}>
      {t('tagline')}
    </h1>
  );
}
