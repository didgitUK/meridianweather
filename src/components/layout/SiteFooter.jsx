'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { FooterBrand } from '@/components/layout/footer/FooterBrand';
import { FooterColumn } from '@/components/layout/footer/FooterColumn';
import { FooterAppDownloads } from '@/components/layout/footer/FooterAppDownloads';
import { FooterNewsletter } from '@/components/layout/footer/FooterNewsletter';
import { FooterLegalBar } from '@/components/layout/footer/FooterLegalBar';
import { cn } from '@/lib/utils';

const footerStyle = {
  backgroundColor: 'var(--color-header-bg)',
  borderColor: 'var(--color-header-border)',
  color: 'var(--color-header-fg)',
};

const legalBarStyle = {
  backgroundColor: 'var(--color-footer-legal-bg)',
  borderColor: 'var(--color-header-border)',
};

function isAdminPortalPath(pathname) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function FooterMarketing() {
  const t = useTranslations('Footer');

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="flex flex-col gap-8">
          <FooterBrand />
          <FooterColumn
            title={
              <>
                <span className="line-through opacity-70">{t('getTheApp')}</span>
                <span className="ml-2 normal-case tracking-normal">{t('comingSoon')}</span>
              </>
            }
          >
            <FooterAppDownloads />
          </FooterColumn>
        </div>

        <div className="rounded-xl border p-6 sm:p-7" style={legalBarStyle}>
          <FooterColumn title={t('newsletterTitle')}>
            <FooterNewsletter />
          </FooterColumn>
        </div>
      </div>
    </div>
  );
}

function FooterLegalSection({ variant }) {
  const isAdmin = variant === 'admin';

  return (
    <div
      className={cn('border-t px-4 sm:px-6', isAdmin ? 'py-4 sm:py-5' : 'py-8 sm:py-10')}
      style={legalBarStyle}
    >
      <div className="mx-auto w-full max-w-6xl">
        <FooterLegalBar variant={variant} />
      </div>
    </div>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  const isAdminPortal = isAdminPortalPath(pathname);

  if (isAdminPortal) {
    return null;
  }

  return (
    <footer className="mt-auto border-t" style={footerStyle}>
      <FooterMarketing />
      <FooterLegalSection variant="default" />
    </footer>
  );
}
