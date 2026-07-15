'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function FooterBrand() {
  const t = useTranslations('Brand');

  return (
    <div className="flex flex-col gap-4">
      <Link href="/" className="inline-flex w-fit max-w-full">
        <BrandLogo size="lg" variant="on-dark" />
      </Link>
      <div className="max-w-2xl">
        <p className={cn(TYPOGRAPHY.heading, 'text-3xl leading-tight')}>{t('tagline')}</p>
        <p className={cn('mt-3 leading-relaxed', TYPOGRAPHY.body)} style={{ color: 'var(--color-header-muted)' }}>
          {t('description')}
        </p>
      </div>
    </div>
  );
}
