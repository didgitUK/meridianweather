'use client';

import Link from 'next/link';
import { BRAND } from '@/constants/brand';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function FooterBrand() {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/" className="inline-flex w-fit max-w-full">
        <BrandLogo size="lg" variant="on-dark" />
      </Link>
      <div className="max-w-2xl">
        <p className={cn(TYPOGRAPHY.heading, 'text-3xl leading-tight')}>{BRAND.tagline}</p>
        <p className={cn('mt-3 leading-relaxed', TYPOGRAPHY.body)} style={{ color: 'var(--color-header-muted)' }}>
          {BRAND.description}
        </p>
      </div>
    </div>
  );
}
