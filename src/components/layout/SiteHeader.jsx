'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useScrollHeaderVisibility } from '@/hooks/useScrollHeaderVisibility';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { CitySearch } from '@/features/cities/components/CitySearch';
import { useCheckCityNavigation } from '@/features/cities/hooks/useCheckCityNavigation';
import { cn } from '@/lib/utils';
import { SPACING } from '@/constants/design-tokens';

function isAdminPortalPath(pathname) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

/** Public marketing/weather UI — exclude admin and auth-wall routes. */
function isPublicFrontendRoute(pathname) {
  if (isAdminPortalPath(pathname)) {
    return false;
  }

  return (
    !pathname.endsWith('/login')
    && !pathname.includes('/forgot-password')
    && !pathname.includes('/reset-password')
    && !pathname.includes('/invite/')
  );
}

export function SiteHeader() {
  const t = useTranslations('Header');
  const pathname = usePathname();
  const { reducedMotion } = useAccessibility();
  const handleCheckCity = useCheckCityNavigation();
  const isAdminPortal = isAdminPortalPath(pathname);
  const showPublicChrome = isPublicFrontendRoute(pathname);
  const autoHide = showPublicChrome;
  const isVisible = useScrollHeaderVisibility(autoHide && !reducedMotion);
  const headerRef = useRef(null);

  useEffect(() => {
    if (isAdminPortal || !autoHide || !headerRef.current) {
      document.documentElement.style.removeProperty('--site-header-height');
      document.documentElement.style.removeProperty('--site-header-sticky-offset');
      return;
    }

    function syncHeaderHeight() {
      const height = headerRef.current?.offsetHeight;
      if (height) {
        document.documentElement.style.setProperty('--site-header-height', `${height}px`);
      }
    }

    syncHeaderHeight();
    window.addEventListener('resize', syncHeaderHeight);

    return () => {
      window.removeEventListener('resize', syncHeaderHeight);
      document.documentElement.style.removeProperty('--site-header-height');
      document.documentElement.style.removeProperty('--site-header-sticky-offset');
    };
  }, [autoHide, isAdminPortal]);

  useEffect(() => {
    if (isAdminPortal || !autoHide) {
      return;
    }

    document.documentElement.style.setProperty(
      '--site-header-sticky-offset',
      isVisible ? 'var(--site-header-height, 4.5rem)' : '0px',
    );
  }, [autoHide, isAdminPortal, isVisible]);

  if (isAdminPortal) {
    return null;
  }

  const headerClassName = cn(
    'border-b',
    autoHide && 'fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-out',
    autoHide && !isVisible && '-translate-y-full',
    autoHide && reducedMotion && 'transition-none',
  );

  const headerStyle = {
    backgroundColor: 'var(--color-header-bg)',
    borderColor: 'var(--color-header-border)',
    color: 'var(--color-header-fg)',
  };

  const headerContent = (
    <header ref={autoHide ? headerRef : undefined} className={headerClassName} style={headerStyle}>
      <div
        className={cn(
          'mx-auto flex w-full max-w-6xl items-center gap-3 py-3 sm:gap-4 sm:py-4',
          SPACING.pageX,
        )}
      >
        <Link href="/" className="inline-flex min-w-0 shrink items-center">
          <BrandLogo size="md" variant="on-dark" />
        </Link>

        {showPublicChrome ? (
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            <div className="min-w-0 w-full max-w-[12rem] sm:max-w-xs md:max-w-sm lg:max-w-md">
              <CitySearch
                onSelect={handleCheckCity}
                variant="header"
                actionLabel={t('checkAction')}
                inputId="header-city-search"
                hideLocationHint
              />
            </div>
            <LanguageSwitcher />
          </div>
        ) : null}
      </div>
    </header>
  );

  if (!autoHide) {
    return headerContent;
  }

  return (
    <>
      {headerContent}
      <div
        aria-hidden
        className="shrink-0"
        style={{ height: 'var(--site-header-height, 4.5rem)' }}
      />
    </>
  );
}
