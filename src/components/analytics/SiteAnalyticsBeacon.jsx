'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { SITE_ANALYTICS_EVENT_TYPES } from '@/constants/site-analytics';
import { parseStoredConsent } from '@/lib/consent-storage';
import { useConsent } from '@/providers/ConsentProvider';

const SESSION_KEY = 'meridian_analytics_sid';
const FLUSH_MS = 8_000;

function getSessionId() {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return `anon_${Date.now()}`;
  }
}

function shouldTrackPath(pathname) {
  if (!pathname) return false;
  return !(
    pathname.includes('/admin') ||
    pathname.includes('/login') ||
    pathname.startsWith('/api')
  );
}

function createQueue() {
  /** @type {Array<{ type: string, path: string, sessionId: string, slotId?: string, value?: number }>} */
  const items = [];

  function enqueue(event) {
    items.push(event);
  }

  function flush() {
    if (items.length === 0) return;
    if (!parseStoredConsent().analytics) {
      items.splice(0, items.length);
      return;
    }

    const batch = items.splice(0, items.length);
    // Consent is bound server-side via signed meridian_consent cookie — do not send flags.
    const body = JSON.stringify({ events: batch });

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([body], { type: 'application/json' });
        if (navigator.sendBeacon('/api/analytics/collect', blob)) {
          return;
        }
      }
    } catch {
      // Fall through to fetch.
    }

    void fetch('/api/analytics/collect', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }

  return { enqueue, flush, items };
}

/**
 * First-party traffic beacon: pageviews, engagement seconds, max scroll depth.
 * Requires analytics consent. Ad slot views via trackSiteAdView() need advertising consent.
 */
export function SiteAnalyticsBeacon() {
  const pathname = usePathname();
  const { consent } = useConsent();
  const queueRef = useRef(null);
  const sessionRef = useRef('');
  const maxScrollRef = useRef(0);
  const engagedSecondsRef = useRef(0);
  const pathRef = useRef('');

  if (!queueRef.current) {
    queueRef.current = createQueue();
  }

  useEffect(() => {
    if (!consent.analytics) {
      return undefined;
    }

    sessionRef.current = getSessionId();
    const queue = queueRef.current;
    const flushTimer = window.setInterval(() => queue.flush(), FLUSH_MS);

    function onVisibility() {
      if (document.visibilityState === 'hidden') {
        queue.flush();
      }
    }

    window.addEventListener('pagehide', () => queue.flush());
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(flushTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      queue.flush();
    };
  }, [consent.analytics]);

  useEffect(() => {
    if (!consent.analytics || !shouldTrackPath(pathname)) {
      return undefined;
    }

    const queue = queueRef.current;
    const sessionId = sessionRef.current || getSessionId();
    pathRef.current = pathname;
    maxScrollRef.current = 0;
    engagedSecondsRef.current = 0;

    queue.enqueue({
      type: SITE_ANALYTICS_EVENT_TYPES.pageview,
      path: pathname,
      sessionId,
    });

    const engagementTimer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      engagedSecondsRef.current += 1;
    }, 1000);

    function onScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) {
        maxScrollRef.current = 100;
        return;
      }
      const pct = Math.round((window.scrollY / scrollable) * 100);
      maxScrollRef.current = Math.max(maxScrollRef.current, Math.min(100, pct));
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearInterval(engagementTimer);
      window.removeEventListener('scroll', onScroll);

      queue.enqueue({
        type: SITE_ANALYTICS_EVENT_TYPES.scroll,
        path: pathname,
        sessionId,
        value: maxScrollRef.current,
      });

      if (engagedSecondsRef.current > 0) {
        queue.enqueue({
          type: SITE_ANALYTICS_EVENT_TYPES.engagement,
          path: pathname,
          sessionId,
          value: engagedSecondsRef.current,
        });
      }

      queue.flush();
    };
  }, [pathname, consent.analytics]);

  return null;
}

/**
 * Report an ad placement entered the viewport (once per placement per page).
 * Requires advertising consent.
 * @param {string} placement
 */
export function trackSiteAdView(placement) {
  if (typeof window === 'undefined') return;
  if (!parseStoredConsent().advertising) return;

  const pathname = window.location.pathname;
  if (!shouldTrackPath(pathname)) return;

  void fetch('/api/analytics/collect', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      events: [
        {
          type: SITE_ANALYTICS_EVENT_TYPES.adView,
          path: pathname,
          sessionId: getSessionId(),
          slotId: String(placement || 'unknown'),
          value: 1,
        },
      ],
    }),
    keepalive: true,
  }).catch(() => {});
}
