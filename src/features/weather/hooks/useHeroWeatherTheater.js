'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  HERO_TIMELINE_MS_PER_HOUR,
  clampHeroHourIndex,
  disabledTheaterFrame,
  heroTimelineIdentity,
  selectHeroTimelineHours,
  theaterFrameAtIndex,
} from '@/features/weather/utils/hero-weather-timeline';

function readPrefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function readDocumentHidden() {
  if (typeof document === 'undefined') {
    return false;
  }
  return document.visibilityState === 'hidden';
}

/**
 * Silent 24h hero theater: continuous scrub progress + overlay frame from hourly.
 */
export function useHeroWeatherTheater({ hourlyPoints, weather, enabled = true }) {
  const hours = useMemo(
    () => (enabled ? selectHeroTimelineHours(hourlyPoints) : []),
    [enabled, hourlyPoints],
  );
  const timelineKey = useMemo(() => heroTimelineIdentity(hours), [hours]);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [hourIndex, setHourIndex] = useState(0);
  // Start paused until mount resolves reduced-motion (avoids autoplay flash).
  const [playing, setPlaying] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const resumeAfterVisibleRef = useRef(false);
  const playingRef = useRef(false);
  const prevTimelineKeyRef = useRef(timelineKey);
  const hourIndexRef = useRef(0);
  playingRef.current = playing;
  hourIndexRef.current = hourIndex;

  useEffect(() => {
    const reduced = readPrefersReducedMotion();
    setReducedMotion(reduced);
    setPlaying(!reduced && enabled);
    setHourIndex(0);
    hourIndexRef.current = 0;

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      const next = media.matches;
      setReducedMotion(next);
      if (next) {
        setPlaying(false);
        setHourIndex(0);
        hourIndexRef.current = 0;
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [enabled]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const onVisibility = () => {
      const hidden = readDocumentHidden();
      setTabHidden(hidden);
      if (hidden) {
        resumeAfterVisibleRef.current = playingRef.current;
        setPlaying(false);
        return;
      }
      if (resumeAfterVisibleRef.current && !reducedMotion && enabled) {
        resumeAfterVisibleRef.current = false;
        setPlaying(true);
      }
    };

    setTabHidden(readDocumentHidden());
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [enabled, reducedMotion]);

  useEffect(() => {
    if (prevTimelineKeyRef.current === timelineKey) {
      setHourIndex((prev) => {
        const next = clampHeroHourIndex(prev, hours.length);
        hourIndexRef.current = next;
        return next;
      });
      return;
    }
    prevTimelineKeyRef.current = timelineKey;
    setHourIndex(0);
    hourIndexRef.current = 0;
  }, [timelineKey, hours.length]);

  // Continuous autoplay: advance float index with rAF (~1s per forecast hour).
  useEffect(() => {
    if (!enabled || !playing || reducedMotion || tabHidden || hours.length === 0) {
      return undefined;
    }

    let rafId = 0;
    let lastTs = 0;
    const length = hours.length;
    const speed = 1 / HERO_TIMELINE_MS_PER_HOUR; // hours per ms

    const tick = (ts) => {
      if (!lastTs) {
        lastTs = ts;
      }
      const dt = Math.min(64, ts - lastTs);
      lastTs = ts;
      const next = (hourIndexRef.current + dt * speed) % length;
      hourIndexRef.current = next;
      setHourIndex(next);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [enabled, playing, reducedMotion, tabHidden, hours.length]);

  const frame = useMemo(() => {
    if (!enabled) {
      return disabledTheaterFrame();
    }

    return theaterFrameAtIndex(hours, hourIndex, weather, {
      sunrise: weather?.sunrise ?? null,
      sunset: weather?.sunset ?? null,
    });
  }, [enabled, hours, hourIndex, weather]);

  const togglePlaying = useCallback(() => {
    if (reducedMotion || !enabled) {
      return;
    }
    setPlaying((prev) => !prev);
  }, [enabled, reducedMotion]);

  const scrubTo = useCallback((nextIndex) => {
    if (!enabled || hours.length === 0) {
      return;
    }
    const clamped = clampHeroHourIndex(nextIndex, hours.length);
    hourIndexRef.current = clamped;
    setHourIndex(clamped);
    if (!reducedMotion) {
      setPlaying(false);
      resumeAfterVisibleRef.current = false;
    }
  }, [enabled, hours.length, reducedMotion]);

  const isPlaying = Boolean(enabled && playing && !reducedMotion && !tabHidden);

  return {
    hours: enabled ? hours : [],
    hourIndex: enabled ? hourIndex : 0,
    scrubTo,
    playing: isPlaying,
    togglePlaying,
    setPlaying,
    reducedMotion,
    frame,
    ready: enabled && (hours.length > 0 || Boolean(weather)),
  };
}
