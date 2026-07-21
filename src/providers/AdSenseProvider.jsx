'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useConsent } from '@/providers/ConsentProvider';
import { useAdFree } from '@/providers/AdFreeProvider';

const AdSenseContext = createContext({
  config: null,
  scriptReady: false,
  getPlacement: async () => null,
  adsSuppressed: false,
});

const ADSENSE_SCRIPT_ID = 'google-adsense';

function findAdSenseScript() {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.getElementById(ADSENSE_SCRIPT_ID);
}

function setAdRequestsPaused(paused) {
  if (typeof window === 'undefined') {
    return;
  }
  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.pauseAdRequests = paused ? 1 : 0;
}

function removeAdSenseScript() {
  const existing = findAdSenseScript();
  if (existing) {
    existing.remove();
  }
}

export function AdSenseProvider({ children }) {
  const { consent } = useConsent();
  const { isAdFree } = useAdFree();
  const [config, setConfig] = useState(null);
  const [scriptReady, setScriptReady] = useState(false);
  const placementCacheRef = useRef(new Map());

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      const response = await fetch('/api/ads/config');
      const payload = await response.json();

      if (!cancelled) {
        setConfig(payload);
      }
    }

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  const shouldServeAds =
    !isAdFree
    && consent.advertising
    && config?.scriptEnabled
    && config?.clientId;

  useEffect(() => {
    setAdRequestsPaused(isAdFree || !consent.advertising);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.adFree = isAdFree ? '1' : '0';
    }
  }, [isAdFree, consent.advertising]);

  useEffect(() => {
    if (!shouldServeAds || !config?.clientId) {
      removeAdSenseScript();
      queueMicrotask(() => setScriptReady(false));
      return undefined;
    }

    const existing = findAdSenseScript();
    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true') {
        queueMicrotask(() => setScriptReady(true));
        return undefined;
      }

      const onLoad = () => {
        existing.setAttribute('data-loaded', 'true');
        setScriptReady(true);
      };
      existing.addEventListener('load', onLoad, { once: true });
      return () => existing.removeEventListener('load', onLoad);
    }

    const script = document.createElement('script');
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.clientId}`;
    script.onload = () => {
      script.setAttribute('data-loaded', 'true');
      setScriptReady(true);
    };
    script.onerror = () => setScriptReady(false);
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [config?.clientId, shouldServeAds]);

  const getPlacement = useCallback(async (placement) => {
    if (isAdFree) {
      return null;
    }

    const cache = placementCacheRef.current;

    if (cache.has(placement)) {
      return cache.get(placement);
    }

    const response = await fetch(`/api/ads?placement=${encodeURIComponent(placement)}`);
    const payload = await response.json();
    cache.set(placement, payload);

    return payload;
  }, [isAdFree]);

  const value = useMemo(
    () => ({
      config,
      scriptReady: shouldServeAds ? scriptReady : false,
      getPlacement,
      adsSuppressed: isAdFree,
    }),
    [config, getPlacement, scriptReady, shouldServeAds, isAdFree],
  );

  return <AdSenseContext.Provider value={value}>{children}</AdSenseContext.Provider>;
}

export function useAdSense() {
  return useContext(AdSenseContext);
}
