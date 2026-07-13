'use client';

import { useSyncExternalStore } from 'react';

function subscribeToStorage() {
  return () => {};
}

export function useHasMounted() {
  return useSyncExternalStore(subscribeToStorage, () => true, () => false);
}

export function useLocalStorageValue(key, serverFallback = '') {
  return useSyncExternalStore(
    (onStoreChange) => {
      const handler = (event) => {
        if (event.key === key || event.type === 'meridian:storage') {
          onStoreChange();
        }
      };

      window.addEventListener('storage', handler);
      window.addEventListener('meridian:storage', handler);
      return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener('meridian:storage', handler);
      };
    },
    () => window.localStorage.getItem(key) ?? serverFallback,
    () => serverFallback,
  );
}

export function writeLocalStorageValue(key, value) {
  window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event('meridian:storage'));
}
