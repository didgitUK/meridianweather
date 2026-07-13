'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { writeLocalStorageValue } from '@/hooks/use-browser-storage';

function subscribe(onStoreChange) {
  const handler = () => onStoreChange();
  window.addEventListener('meridian:storage', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('meridian:storage', handler);
    window.removeEventListener('storage', handler);
  };
}

function readClientId() {
  return window.localStorage.getItem(STORAGE_KEYS.clientId) ?? '';
}

export function useClientId() {
  const clientId = useSyncExternalStore(subscribe, readClientId, () => '');

  useEffect(() => {
    if (clientId) {
      return;
    }

    writeLocalStorageValue(STORAGE_KEYS.clientId, uuidv4());
  }, [clientId]);

  return clientId;
}
