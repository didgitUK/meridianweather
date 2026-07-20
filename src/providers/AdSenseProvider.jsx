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

const AdSenseContext = createContext({
  config: null,
  scriptReady: false,
  getPlacement: async () => null,
});

const ADSENSE_SCRIPT_ID = 'google-adsense';

function findAdSenseScript() {
  if (typeof document === 'undefined') {
    return null;
  }

  return (
    document.getElementById(ADSENSE_SCRIPT_ID)
    || document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')
  );
}

export function AdSenseProvider({ children }) {
  const { consent } = useConsent();
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

  // Ad fills stay consent-gated. The loader script itself is SSR'd in root layout
  // so AdSense crawlers can verify the site without accepting cookies.
  const shouldServeAds = consent.advertising && config?.scriptEnabled && config?.clientId;

  useEffect(() => {
    if (!shouldServeAds || !config?.clientId) {
      queueMicrotask(() => setScriptReady(false));
      return undefined;
    }

    const existing = findAdSenseScript();
    if (existing) {
      if (
        existing.getAttribute('data-loaded') === 'true'
        || existing.getAttribute('data-nscript')
        || existing.async
      ) {
        // Root-layout script is already in the document for verification.
        queueMicrotask(() => setScriptReady(true));
        return undefined;
      }

      existing.addEventListener('load', () => setScriptReady(true), { once: true });
      return undefined;
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
    const cache = placementCacheRef.current;

    if (cache.has(placement)) {
      return cache.get(placement);
    }

    const response = await fetch(`/api/ads?placement=${encodeURIComponent(placement)}`);
    const payload = await response.json();
    cache.set(placement, payload);

    return payload;
  }, []);

  const value = useMemo(
    () => ({
      config,
      scriptReady: shouldServeAds ? scriptReady : false,
      getPlacement,
    }),
    [config, getPlacement, scriptReady, shouldServeAds],
  );

  return <AdSenseContext.Provider value={value}>{children}</AdSenseContext.Provider>;
}

export function useAdSense() {
  return useContext(AdSenseContext);
}
