'use client';

import { useEffect, useRef } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useScrollHeaderVisibility } from '@/hooks/useScrollHeaderVisibility';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { cn } from '@/lib/utils';
import { SPACING } from '@/constants/design-tokens';

function isAutoHideRoute(pathname) {
  return !pathname.endsWith('/login') && !pathname.includes('/admin');
}

function isAdminPortalPath(pathname) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export function SiteHeader() {
  const pathname = usePathname();
  const { reducedMotion } = useAccessibility();
  const isAdminPortal = isAdminPortalPath(pathname);
  const autoHide = !isAdminPortal && isAutoHideRoute(pathname);
  const isVisible = useScrollHeaderVisibility(autoHide && !reducedMotion);
  const headerRef = useRef(null);

  useEffect(() => {
    if (isAdminPortal || !autoHide || !headerRef.current) {
      document.documentElement.style.removeProperty('--site-header-height');
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
    };
  }, [autoHide, isAdminPortal]);

  if (isAdminPortal) {
    return null;
  }

  const headerClassName = cn(
    'border-b',
    autoHide && 'fixed inset-x-0 top-0 z-40 transition-transform duration-300 ease-out',
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
      <div className={cn('mx-auto flex w-full max-w-6xl items-center py-3 sm:py-4', SPACING.pageX)}>
        <Link href="/" className="inline-flex min-w-0 shrink items-center">
          <BrandLogo size="md" variant="on-dark" />
        </Link>
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
