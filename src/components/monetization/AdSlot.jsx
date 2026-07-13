'use client';

import { useEffect, useRef, useState } from 'react';
import { useConsent } from '@/providers/ConsentProvider';
import { useAdSense } from '@/providers/AdSenseProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { AdPlaceholder } from '@/components/monetization/AdPlaceholder';

export function AdSlot({ placement = 'dashboard', className = '' }) {
  const { consent } = useConsent();
  const { scriptReady, getPlacement } = useAdSense();
  const { openPrivacyPreferences } = useSettings();
  const adRef = useRef(null);
  const [config, setConfig] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const pushedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const payload = await getPlacement(placement);
        if (!cancelled) {
          setConfig(payload ?? { scriptEnabled: false, testMode: true });
          setLoadFailed(false);
        }
      } catch {
        if (!cancelled) {
          setConfig({
            scriptEnabled: false,
            testMode: true,
            fallback: {
              label: 'Demo ad — AdSense unavailable',
              href: '/docs/monetization',
            },
          });
          setLoadFailed(true);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [getPlacement, placement]);

  const canShowAd = config?.scriptEnabled && consent.advertising && scriptReady;

  useEffect(() => {
    pushedRef.current = false;
  }, [placement, config?.clientId, config?.slotId]);

  useEffect(() => {
    if (!canShowAd || !adRef.current || !config?.clientId || pushedRef.current) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      // AdSense push failed — fall through visually via parent re-render if needed.
    }
  }, [canShowAd, config]);

  if (!config) {
    return (
      <AdPlaceholder
        placement={placement}
        label="Loading ad placement…"
        className={className}
      />
    );
  }

  if (config.testMode || !config.scriptEnabled || loadFailed) {
    return (
      <AdPlaceholder
        placement={placement}
        label={config.fallback?.label ?? 'Demo ad — AdSense not configured'}
        href={config.fallback?.href ?? '/docs/monetization'}
        className={className}
        showConsentCta={!consent.advertising}
        onOpenSettings={openPrivacyPreferences}
      />
    );
  }

  if (!consent.advertising) {
    return (
      <div className={`rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground ${className}`}>
        <p>Advertising is disabled in your cookie preferences.</p>
        <button type="button" className="mt-2 underline" onClick={openPrivacyPreferences}>
          Open settings
        </button>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-border/60 bg-muted/20 p-2 ${className}`}
      role="complementary"
      aria-label={`Advertisement ${placement}`}
    >
      <ins
        ref={adRef}
        className="adsbygoogle block min-h-[90px] w-full"
        style={{ display: 'block' }}
        data-ad-client={config.clientId}
        data-ad-format={config.format}
        data-full-width-responsive={config.fullWidthResponsive ? 'true' : 'false'}
        {...(config.slotId ? { 'data-ad-slot': config.slotId } : {})}
        {...(config.adTest ? { 'data-adtest': 'on' } : {})}
      />
    </div>
  );
}
