'use client';

import { usePathname } from '@/i18n/navigation';
import { SettingsFab } from '@/components/layout/settings/SettingsFab';
import { ThemeToggleButton } from '@/components/layout/settings/ThemeToggleButton';
import { TemperatureUnitSwitch } from '@/features/weather/components/TemperatureUnitSwitch';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { SAFE_AREA } from '@/constants/design-tokens';
import { useScrollHeaderVisibility } from '@/hooks/useScrollHeaderVisibility';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { cn } from '@/lib/utils';
import { useHasMounted, useLocalStorageValue } from '@/hooks/use-browser-storage';

function isPublicFrontendRoute(pathname) {
  return !pathname.endsWith('/login') && !pathname.includes('/admin');
}

export function FloatingControlsDock({ onOpenSettings }) {
  const pathname = usePathname();
  const isMounted = useHasMounted();
  const { reducedMotion } = useAccessibility();
  const cookieConsent = useLocalStorageValue(STORAGE_KEYS.cookieConsent);
  const bannerVisible = isMounted && cookieConsent !== 'accepted';
  const showFrontendControls = isPublicFrontendRoute(pathname);
  const showSettings = useScrollHeaderVisibility(showFrontendControls && !reducedMotion);

  if (!showFrontendControls) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed left-4 z-50',
        bannerVisible
          ? 'bottom-[calc(17rem+var(--safe-area-inset-bottom))] sm:bottom-56'
          : SAFE_AREA.bottom,
      )}
    >
      <div
        className={cn(
          'flex h-11 items-center gap-1 rounded-xl border border-border px-1',
          'bg-white shadow-lg dark:bg-[var(--color-background)]',
        )}
      >
        <div
          className={cn(
            'grid transition-[grid-template-columns] duration-300 ease-out',
            showSettings ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]',
            reducedMotion && 'transition-none',
          )}
        >
          <div
            className="min-w-0 overflow-hidden"
            inert={showSettings ? undefined : true}
          >
            <SettingsFab
              onOpen={onOpenSettings}
              className={cn(
                'rounded-lg border-0 bg-transparent shadow-none',
                'hover:bg-muted/80 active:bg-muted/80',
                'dark:bg-transparent dark:hover:bg-muted/80 dark:active:bg-muted/80',
                'transition-opacity duration-300 ease-out',
                showSettings ? 'opacity-100' : 'opacity-0',
                reducedMotion && 'transition-none',
              )}
            />
          </div>
        </div>

        <ThemeToggleButton />

        <TemperatureUnitSwitch className="h-auto border-0 bg-transparent px-1.5 shadow-none" />
      </div>
    </div>
  );
}
