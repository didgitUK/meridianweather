'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useConsent } from '@/providers/ConsentProvider';
import { useAdSense } from '@/providers/AdSenseProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { AdPlaceholder } from '@/components/monetization/AdPlaceholder';
import { trackSiteAdView } from '@/components/analytics/SiteAnalyticsBeacon';
import { isHeroAdPlacement } from '@/constants/monetization';
import { cn } from '@/lib/utils';

const UNFILLED_FALLBACK_MS = 2800;

export function AdSlot({
  placement = 'dashboard',
  className = '',
  imageUrl: _imageUrl = null,
  location: _location = null,
}) {
  const { consent } = useConsent();
  const { scriptReady, getPlacement } = useAdSense();
  const { openPrivacyPreferences } = useSettings();
  const adRef = useRef(null);
  const slotRootRef = useRef(null);
  const [config, setConfig] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [adStatus, setAdStatus] = useState('idle'); // idle | trying | filled | unfilled
  const pushedRef = useRef(false);
  const viewedRef = useRef(false);
  const isHero = isHeroAdPlacement(placement);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const payload = await getPlacement(placement);
        if (!cancelled) {
          setConfig(payload ?? { scriptEnabled: false, testMode: true });
          setLoadFailed(false);
          setAdStatus('idle');
        }
      } catch {
        if (!cancelled) {
          setConfig({
            scriptEnabled: false,
            testMode: true,
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

  const wantsLiveAd =
    Boolean(config)
    && config.scriptEnabled
    && !config.testMode
    && !loadFailed
    && consent.advertising
    && scriptReady;

  const tryLiveAd = wantsLiveAd && adStatus !== 'unfilled';
  const adFilled = adStatus === 'filled';
  const showsPlacement = Boolean(config);

  useEffect(() => {
    pushedRef.current = false;
    viewedRef.current = false;
    setAdStatus('idle');
  }, [placement, config?.clientId, config?.slotId]);

  useLayoutEffect(() => {
    if (!tryLiveAd) {
      return undefined;
    }

    setAdStatus((prev) => (prev === 'filled' ? prev : 'trying'));

    const el = adRef.current;
    if (!el || pushedRef.current) {
      return undefined;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      setAdStatus('unfilled');
      return undefined;
    }

    function syncStatus() {
      const status = el.getAttribute('data-ad-status');
      if (status === 'filled') {
        setAdStatus('filled');
      } else if (status === 'unfilled') {
        setAdStatus('unfilled');
      }
    }

    const observer = new MutationObserver(syncStatus);
    observer.observe(el, { attributes: true, attributeFilter: ['data-ad-status'] });
    syncStatus();

    const timer = window.setTimeout(() => {
      const status = el.getAttribute('data-ad-status');
      if (status !== 'filled') {
        setAdStatus('unfilled');
      }
    }, UNFILLED_FALLBACK_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [tryLiveAd, config?.clientId, config?.slotId]);

  useEffect(() => {
    if (!showsPlacement || !slotRootRef.current || viewedRef.current) {
      return undefined;
    }

    const node = slotRootRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.4,
        );
        if (!visible || viewedRef.current) return;
        viewedRef.current = true;
        trackSiteAdView(placement);
        observer.disconnect();
      },
      { threshold: [0.4] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [showsPlacement, placement, adFilled, wantsLiveAd]);

  return (
    <div
      ref={slotRootRef}
      className={cn('relative', isHero ? 'size-full min-h-0' : undefined, className)}
      role="complementary"
      aria-label={`Advertisement ${placement}`}
    >
      {tryLiveAd ? (
        <div
          className={cn(
            'absolute inset-0 z-0 overflow-hidden rounded-[inherit]',
            adFilled ? 'bg-background' : 'pointer-events-none',
          )}
          aria-hidden={!adFilled}
        >
          <ins
            ref={adRef}
            className="adsbygoogle block size-full min-h-[120px] w-full"
            style={{ display: 'block' }}
            data-ad-client={config.clientId}
            data-ad-format={config.format}
            data-full-width-responsive={config.fullWidthResponsive ? 'true' : 'false'}
            {...(config.slotId ? { 'data-ad-slot': config.slotId } : {})}
            {...(config.adTest ? { 'data-adtest': 'on' } : {})}
          />
        </div>
      ) : null}

      <div
        className={cn(
          'relative z-10 size-full min-h-0',
          adFilled && 'pointer-events-none invisible',
        )}
        aria-hidden={adFilled ? true : undefined}
      >
        <AdPlaceholder
          placement={placement}
          className="size-full min-h-[8rem]"
          showConsentCta={
            Boolean(config) && !consent.advertising && !config.testMode && config.scriptEnabled
          }
          onOpenSettings={openPrivacyPreferences}
        />
      </div>
    </div>
  );
}
