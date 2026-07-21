'use client';

import { useEffect, useRef } from 'react';
import { useLocationSearch } from '@/providers/LocationSearchProvider';
import { useSettings } from '@/providers/SettingsProvider';

/** Bottom band including nav (~4.5rem) + small edge buffer. */
const EDGE_MAX_FROM_BOTTOM_PX = 100;
const MIN_UP_PX = 56;
const MAX_HORIZONTAL_PX = 40;
const MOBILE_MQ = '(max-width: 767px)';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isMobileViewport() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(MOBILE_MQ).matches;
}

/**
 * Bottom-edge swipe-up opens the location search sheet on mobile.
 * Starts only near the bottom (nav / home-indicator zone) to avoid scroll fights.
 */
export function useBottomEdgeSwipeSearch() {
  const { openSearch, isSearchOpen } = useLocationSearch();
  const { isSettingsOpen } = useSettings();
  const startRef = useRef(null);
  const openSearchRef = useRef(openSearch);
  const blockedRef = useRef(false);

  openSearchRef.current = openSearch;
  blockedRef.current = Boolean(isSearchOpen || isSettingsOpen);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    function onTouchStart(event) {
      if (!isMobileViewport() || prefersReducedMotion() || blockedRef.current) {
        startRef.current = null;
        return;
      }
      if (event.touches.length !== 1) {
        startRef.current = null;
        return;
      }

      const touch = event.touches[0];
      const fromBottom = window.innerHeight - touch.clientY;
      if (fromBottom > EDGE_MAX_FROM_BOTTOM_PX) {
        startRef.current = null;
        return;
      }

      startRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    }

    function onTouchEnd(event) {
      const start = startRef.current;
      startRef.current = null;
      if (!start || blockedRef.current || prefersReducedMotion()) {
        return;
      }

      const touch = event.changedTouches?.[0];
      if (!touch) {
        return;
      }

      const dy = start.y - touch.clientY;
      const dx = Math.abs(touch.clientX - start.x);
      if (dy < MIN_UP_PX || dx > MAX_HORIZONTAL_PX) {
        return;
      }

      openSearchRef.current();
    }

    function onTouchCancel() {
      startRef.current = null;
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchCancel);
    };
  }, []);
}

/**
 * Mount-only helper so AppProviders can enable the gesture without prop drilling.
 */
export function BottomEdgeSwipeSearchListener() {
  useBottomEdgeSwipeSearch();
  return null;
}
