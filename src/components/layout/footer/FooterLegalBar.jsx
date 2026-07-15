'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { FooterAdminSignOut } from '@/components/layout/footer/FooterAdminSignOut';
import { LEGAL_ROUTES } from '@/constants/legal';
import { LEGAL_ENTITY } from '@/constants/brand';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

const footerLinkClass =
  'text-[var(--color-header-muted)] underline-offset-4 transition-colors hover:text-[var(--color-header-fg)] hover:underline';

function FooterCopyright() {
  const t = useTranslations('Common');

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
      <Link href="/" className="inline-flex shrink-0 items-center">
        <BrandLogo size="sm" variant="on-dark" />
      </Link>
      <p className={cn('min-w-0', TYPOGRAPHY.caption)} style={{ color: 'var(--color-header-muted)' }}>
        {t('copyright', { year: new Date().getFullYear() })}
        {' | '}
        <a
          href={LEGAL_ENTITY.parentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={footerLinkClass}
        >
          {LEGAL_ENTITY.companyName}
        </a>
        {' '}
        trading as {LEGAL_ENTITY.tradingName}
      </p>
    </div>
  );
}

function FooterLegalNav() {
  const t = useTranslations('Footer');

  return (
    <nav aria-label={t('legalNavLabel')} className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
      {LEGAL_ROUTES.map((route) => (
        <Link key={route.slug} href={route.href} className={footerLinkClass}>
          {route.title}
        </Link>
      ))}
      <Link href="/docs" className={footerLinkClass}>
        {t('documentation')}
      </Link>
      <Link href="/login" className={footerLinkClass}>
        {t('adminAccess')}
      </Link>
    </nav>
  );
}

function FooterAdminNav() {
  return (
    <nav aria-label="Admin" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
      <FooterAdminSignOut className={footerLinkClass} />
    </nav>
  );
}

export function FooterLegalBar({ variant = 'default' }) {
  const isAdmin = variant === 'admin';

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <FooterCopyright />
      {isAdmin ? <FooterAdminNav /> : <FooterLegalNav />}
    </div>
  );
}
