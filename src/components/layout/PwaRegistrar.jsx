'use client';

import { useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { PWA_DAILY_INTERVAL_MS, PWA_PERIODIC_SYNC_TAG } from '@/constants/pwa';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { resolveOpenWeatherLang } from '@/i18n/locales';
import { isFunctionalConsentGranted } from '@/lib/consent-storage';
import { useClientId } from '@/features/cities/hooks/useClientId';
import { useSavedCities } from '@/features/cities/hooks/useSavedCities';
import {
  applyBackgroundWeatherBatch,
  prefetchPriorityCities,
} from '@/features/pwa/prefetch-priority-cities';
import { syncPushCities } from '@/features/pwa/push-client';
import { buildPriorityCities } from '@/features/pwa/priority-cities-store';

async function registerPeriodicSync(registration) {
  if (!registration?.periodicSync) {
    return false;
  }

  try {
    const status = await navigator.permissions?.query({
      name: 'periodic-background-sync',
    });
    if (status && status.state === 'denied') {
      return false;
    }
  } catch {
    // Permission query unsupported — still try register.
  }

  try {
    await registration.periodicSync.register(PWA_PERIODIC_SYNC_TAG, {
      minInterval: PWA_DAILY_INTERVAL_MS,
    });
    return true;
  } catch {
    return false;
  }
}

export function PwaRegistrar() {
  const locale = useLocale();
  const t = useTranslations('Pwa');
  const weatherLang = resolveOpenWeatherLang(locale);
  const clientId = useClientId();
  const { savedCities, isHydrated } = useSavedCities();
  const updateToastShown = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return undefined;
    }

    let cancelled = false;

    async function setup() {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        if (cancelled) {
          return;
        }

        if (isFunctionalConsentGranted()) {
          await registerPeriodicSync(registration);
        }

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) {
            return;
          }
          worker.addEventListener('statechange', () => {
            if (
              worker.state === 'installed'
              && navigator.serviceWorker.controller
              && !updateToastShown.current
            ) {
              updateToastShown.current = true;
              toast.message(t('updateAvailable'), {
                description: t('updateDescription'),
                action: {
                  label: t('reload'),
                  onClick: () => {
                    worker.postMessage({ type: 'meridian:skip-waiting' });
                    window.location.reload();
                  },
                },
              });
            }
          });
        });
      } catch {
        // Registration failed — app still works online.
      }
    }

    void setup();

    function onControllerChange() {
      // New SW took control after skipWaiting without explicit reload action.
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    function onMessage(event) {
      const data = event.data;
      if (data?.type === 'meridian:weather-refreshed') {
        applyBackgroundWeatherBatch({
          batch: data.batch,
          requestCities: data.requestCities,
        });
      }
    }

    navigator.serviceWorker.addEventListener('message', onMessage);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      navigator.serviceWorker.removeEventListener('message', onMessage);
    };
  }, [t]);

  useEffect(() => {
    if (!isHydrated) {
      return undefined;
    }

    let cancelled = false;

    async function runPrefetch() {
      if (cancelled) {
        return;
      }
      const result = await prefetchPriorityCities({
        savedCities,
        trigger: WEATHER_CHECK_TRIGGERS.pwaPrefetch,
        lang: weatherLang,
      });

      if (clientId && isFunctionalConsentGranted()) {
        await syncPushCities({
          clientId,
          cities: result.cities?.length ? result.cities : buildPriorityCities({ savedCities }),
        });
      }
    }

    void runPrefetch();

    function onOnline() {
      void runPrefetch();
    }

    function onStorage() {
      void runPrefetch();
    }

    window.addEventListener('online', onOnline);
    window.addEventListener('meridian:storage', onStorage);

    return () => {
      cancelled = true;
      window.removeEventListener('online', onOnline);
      window.removeEventListener('meridian:storage', onStorage);
    };
  }, [clientId, isHydrated, savedCities, weatherLang]);

  return null;
}
