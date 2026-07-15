'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';
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
    if (typeof window === 'undefined') {
      reject(new Error('Geolocation unavailable'));
      return;
    }

    if (!window.isSecureContext) {
      reject(Object.assign(new Error('Insecure context'), { code: 'INSECURE' }));
      return;
    }

    if (!navigator.geolocation) {
      reject(Object.assign(new Error('Geolocation unavailable'), { code: 'UNSUPPORTED' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(Object.assign(error ?? new Error('Geolocation denied'), {
          code: error?.code === 1 ? 'DENIED' : 'FAILED',
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      },
    );
  });
}

async function readPermissionState() {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return 'unknown';
  }

  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state;
  } catch {
    return 'unknown';
  }
}

export function DashboardHeroActions() {
  const t = useTranslations('Dashboard.hero');
  const tCommon = useTranslations('Common');
  const { consent, setConsent } = useConsent();
  const [hasLocation, setHasLocation] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function syncLocationState() {
      const stored = hasStoredPreciseLocation();
      if (stored) {
        if (!cancelled) {
          setHasLocation(true);
        }
        return;
      }

      const permission = await readPermissionState();
      if (cancelled || permission !== 'granted' || !window.isSecureContext) {
        if (!cancelled) {
          setHasLocation(false);
        }
        return;
      }

      // Browser already granted location — hydrate GPS silently.
      try {
        const position = await requestBrowserLocation();
        if (cancelled) {
          return;
        }
        const previous = readUserLocationProfile();
        const current = resolveEffectiveLocationProfile(previous);
        saveUserLocationProfile({
          ...previous,
          country: current?.country ?? null,
          label: current?.label ?? null,
          lat: position.lat,
          lon: position.lon,
          source: 'gps',
        });
        setHasLocation(true);
      } catch {
        if (!cancelled) {
          setHasLocation(false);
        }
      }
    }

    void syncLocationState();
    window.addEventListener('meridian:storage', syncLocationState);
    return () => {
      cancelled = true;
      window.removeEventListener('meridian:storage', syncLocationState);
    };
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

      if (hasStoredPreciseLocation()) {
        setHasLocation(true);
        return;
      }

      const position = await requestBrowserLocation();
      const stored = readUserLocationProfile();
      const current = resolveEffectiveLocationProfile(stored);

      saveUserLocationProfile({
        ...stored,
        country: current?.country ?? null,
        label: current?.label ?? null,
        lat: position.lat,
        lon: position.lon,
        source: 'gps',
      });

      setHasLocation(true);
      toast.success(t('locationFound'));
    } catch (error) {
      setHasLocation(false);
      if (error?.code === 'INSECURE') {
        toast.error(t('locationNeedsHttps'));
      } else if (error?.code === 'DENIED' || error?.code === 1) {
        toast.error(t('locationDenied'));
      } else if (error?.code === 'UNSUPPORTED') {
        toast.error(t('locationUnsupported'));
      } else {
        toast.error(t('locationFailed'));
      }
    } finally {
      setIsRequesting(false);
    }
  }, [consent.functional, isRequesting, setConsent, t]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {hasLocation ? (
        <div
          className={cn(
            TOUCH.minH,
            'inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 text-base text-foreground',
          )}
          role="status"
        >
          <span
            className="size-2.5 shrink-0 rounded-full bg-emerald-500"
            aria-hidden
          />
          <MapPin className={ICONS.sm} aria-hidden />
          <span>{t('locationFound')}</span>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className={cn(
            TOUCH.minH,
            'gap-2 border-border bg-background px-4 text-base text-foreground hover:bg-background',
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
