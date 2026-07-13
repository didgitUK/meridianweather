'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { useHasMounted, writeLocalStorageValue } from '@/hooks/use-browser-storage';
import {
  clearCitySubscriptions,
  clearNewsletterSubscription,
  hydrateRegistryFromServer,
  mergeSubscriptionOnSuccess,
  parseSubscriptionRegistry,
} from '@/features/subscriptions/utils/subscription-state';

function subscribe(onStoreChange) {
  const handler = () => onStoreChange();
  window.addEventListener('meridian:storage', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('meridian:storage', handler);
    window.removeEventListener('storage', handler);
  };
}

function readRaw() {
  return window.localStorage.getItem(STORAGE_KEYS.subscriptions) ?? '';
}

function writeRegistry(registry) {
  writeLocalStorageValue(STORAGE_KEYS.subscriptions, JSON.stringify(registry));
}

export function useLocalSubscriptions() {
  const isHydrated = useHasMounted();
  const raw = useSyncExternalStore(subscribe, readRaw, () => '');
  const registry = useMemo(() => parseSubscriptionRegistry(raw), [raw]);

  const recordSubscription = useCallback((subscription, cityId = null) => {
    const current = parseSubscriptionRegistry(readRaw());
    writeRegistry(mergeSubscriptionOnSuccess(current, subscription, cityId));
  }, []);

  const clearCity = useCallback((cityId, types) => {
    const current = parseSubscriptionRegistry(readRaw());
    writeRegistry(clearCitySubscriptions(current, cityId, types));
  }, []);

  const clearNewsletter = useCallback(() => {
    const current = parseSubscriptionRegistry(readRaw());
    writeRegistry(clearNewsletterSubscription(current));
  }, []);

  const hydrateFromServer = useCallback((subscriptions, savedCities = []) => {
    const current = parseSubscriptionRegistry(readRaw());
    writeRegistry(hydrateRegistryFromServer(current, subscriptions, savedCities));
  }, []);

  return {
    registry,
    isHydrated,
    recordSubscription,
    clearCity,
    clearNewsletter,
    hydrateFromServer,
  };
}
