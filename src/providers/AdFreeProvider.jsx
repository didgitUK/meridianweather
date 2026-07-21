'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { ADFEEE_PLANS, formatPlanPriceGbp } from '@/constants/billing';

const AdFreeContext = createContext({
  isAdFree: false,
  license: null,
  billingEnabled: false,
  plans: ADFEEE_PLANS,
  formatPrice: formatPlanPriceGbp,
  refresh: async () => {},
  clearLocalLicense: () => {},
  startCheckout: async () => ({ ok: false }),
  requestRestore: async () => ({ ok: false }),
  openPortal: async () => ({ ok: false }),
});

function readLocalLicense() {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.adfree);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeLocalLicense(license) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    if (!license) {
      window.localStorage.removeItem(STORAGE_KEYS.adfree);
      return;
    }
    window.localStorage.setItem(STORAGE_KEYS.adfree, JSON.stringify(license));
  } catch {
    // ignore quota / private mode
  }
}

export function AdFreeProvider({ children }) {
  const [license, setLicense] = useState(null);
  const [billingEnabled, setBillingEnabled] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/billing/status', { credentials: 'include' });
      const payload = await response.json().catch(() => null);
      const next = payload?.license ?? null;
      const enabled = Boolean(payload?.billingEnabled);
      setBillingEnabled(enabled);
      setLicense(next);
      writeLocalLicense(next);
      return next;
    } catch {
      const local = readLocalLicense();
      setLicense(local?.isAdFree ? local : null);
      return local;
    }
  }, []);

  useEffect(() => {
    const local = readLocalLicense();
    if (local?.isAdFree) {
      setLicense(local);
    }
    void refresh();
  }, [refresh]);

  const clearLocalLicense = useCallback(() => {
    writeLocalLicense(null);
    setLicense(null);
  }, []);

  const startCheckout = useCallback(async (planId, email) => {
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ plan: planId, email: email || undefined }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.url) {
      return { ok: false, error: payload?.error || 'Checkout unavailable' };
    }
    window.location.assign(payload.url);
    return { ok: true };
  }, []);

  const requestRestore = useCallback(async (email) => {
    const response = await fetch('/api/billing/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return { ok: false, error: payload?.error || 'Restore failed' };
    }
    return { ok: true, message: payload?.message || 'Check your email' };
  }, []);

  const openPortal = useCallback(async () => {
    const response = await fetch('/api/billing/portal', {
      method: 'POST',
      credentials: 'include',
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.url) {
      return { ok: false, error: payload?.error || 'Portal unavailable' };
    }
    window.location.assign(payload.url);
    return { ok: true };
  }, []);

  const value = useMemo(() => ({
    isAdFree: Boolean(license?.isAdFree),
    license,
    billingEnabled,
    plans: ADFEEE_PLANS,
    formatPrice: formatPlanPriceGbp,
    refresh,
    clearLocalLicense,
    startCheckout,
    requestRestore,
    openPortal,
  }), [
    license,
    billingEnabled,
    refresh,
    clearLocalLicense,
    startCheckout,
    requestRestore,
    openPortal,
  ]);

  return (
    <AdFreeContext.Provider value={value}>
      {children}
    </AdFreeContext.Provider>
  );
}

export function useAdFree() {
  return useContext(AdFreeContext);
}
