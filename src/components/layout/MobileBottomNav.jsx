'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Home, MapPinned, Search, Settings } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { DASHBOARD_LOCATIONS_SECTION_ID } from '@/features/weather/components/DashboardHeroActions';
import { useLocationSearch } from '@/providers/LocationSearchProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { SAFE_AREA, TOUCH } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

function isAdminPortalPath(pathname) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export function MobileBottomNav() {
  const t = useTranslations('MobileNav');
  const pathname = usePathname();
  const { openSearch } = useLocationSearch();
  const { openSettings } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isAdminPortalPath(pathname)) {
    return null;
  }

  const isHome = pathname === '/' || pathname === '';

  return (
    <nav
      aria-label={t('label')}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-md md:hidden',
        SAFE_AREA.paddingBottom,
      )}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 pt-1">
        <li>
          <Link
            href="/"
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-[0.65rem] font-medium text-muted-foreground',
              TOUCH.minH,
              isHome && 'text-foreground',
            )}
          >
            <Home className="size-5" aria-hidden />
            {t('home')}
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={() => openSearch()}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-[0.65rem] font-medium text-muted-foreground',
              TOUCH.minH,
            )}
          >
            <Search className="size-5" aria-hidden />
            {t('search')}
          </button>
        </li>
        <li>
          <Link
            href={`/#${DASHBOARD_LOCATIONS_SECTION_ID}`}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-[0.65rem] font-medium text-muted-foreground',
              TOUCH.minH,
            )}
          >
            <MapPinned className="size-5" aria-hidden />
            {t('myPlaces')}
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={() => openSettings()}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-[0.65rem] font-medium text-muted-foreground',
              TOUCH.minH,
            )}
          >
            <Settings className="size-5" aria-hidden />
            {t('settings')}
          </button>
        </li>
      </ul>
    </nav>
  );
}
