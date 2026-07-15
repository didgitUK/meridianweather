'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { History, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ICONS, TOUCH } from '@/constants/design-tokens';
import {
  readUserLocationProfile,
  resolveEffectiveLocationProfile,
  saveUserLocationProfile,
} from '@/features/cities/utils/user-location-profile';
import { scrollToSection } from '@/lib/scroll-to-section';
import { cn } from '@/lib/utils';
import { useConsent } from '@/providers/ConsentProvider';

export const DASHBOARD_LOCATIONS_SECTION_ID = 'your-locations';
export const DASHBOARD_RECENT_CHECKS_SECTION_ID = 'recent-checks';

function hasStoredPreciseLocation() {
  const profile = resolveEffectiveLocationProfile(readUserLocationProfile());
  return profile?.source === 'gps' || profile?.source === 'confirmed';
}

function requestBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation unavailable'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      reject,
      {
        enableHighAccuracy: false,
        maximumAge: 15 * 60 * 1000,
        timeout: 8000,
      },
    );
  });
}

export function DashboardHeroActions() {
  const t = useTranslations('Dashboard.hero');
  const tCommon = useTranslations('Common');
  const { consent, setConsent } = useConsent();
  const [hasLocation, setHasLocation] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    function syncFromStorage() {
      setHasLocation(hasStoredPreciseLocation());
    }

    syncFromStorage();
    window.addEventListener('meridian:storage', syncFromStorage);
    return () => window.removeEventListener('meridian:storage', syncFromStorage);
  }, []);

  const handleAllowLocation = useCallback(async () => {
    if (isRequesting) {
      return;
    }

    setIsRequesting(true);

    try {
      if (!consent.functional) {
        setConsent({ functional: true });
      }

      const stored = readUserLocationProfile();
      const current = resolveEffectiveLocationProfile(stored);

      if (current?.source === 'confirmed' || current?.source === 'gps') {
        setHasLocation(true);
        return;
      }

      const position = await requestBrowserLocation();

      saveUserLocationProfile({
        ...stored,
        country: current?.country ?? null,
        label: current?.label ?? null,
        lat: position.lat,
        lon: position.lon,
        source: 'gps',
      });

      setHasLocation(true);
    } catch {
      setHasLocation(false);
    } finally {
      setIsRequesting(false);
    }
  }, [consent.functional, isRequesting, setConsent]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {hasLocation ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className={cn(
            TOUCH.minH,
            'gap-2 border-border bg-white px-4 text-base text-neutral-950 hover:bg-white hover:text-neutral-950 dark:bg-white dark:text-neutral-950 dark:hover:bg-white',
          )}
          onClick={() => scrollToSection(DASHBOARD_RECENT_CHECKS_SECTION_ID)}
        >
          <History className={ICONS.sm} aria-hidden />
          {t('recentChecks')}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className={cn(
            TOUCH.minH,
            'gap-2 border-border bg-white px-4 text-base text-neutral-950 hover:bg-white hover:text-neutral-950 dark:bg-white dark:text-neutral-950 dark:hover:bg-white',
          )}
          disabled={isRequesting}
          aria-busy={isRequesting}
          onClick={() => {
            void handleAllowLocation();
          }}
        >
          <MapPin className={ICONS.sm} aria-hidden />
          {isRequesting ? tCommon('loading') : t('allowLocation')}
        </Button>
      )}
      <Button
        type="button"
        variant="default"
        size="lg"
        className={cn(TOUCH.minH, 'gap-2 px-4 text-base')}
        onClick={() => scrollToSection(DASHBOARD_LOCATIONS_SECTION_ID)}
      >
        <Navigation className={cn(ICONS.sm, 'rotate-90')} aria-hidden />
        {t('yourLocations')}
      </Button>
    </div>
  );
}
