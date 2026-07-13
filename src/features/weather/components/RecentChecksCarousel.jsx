'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import {
  RecentCheckCard,
  RecentCheckCardSkeleton,
} from '@/features/weather/components/RecentCheckCard';

const DISPLAY_LIMIT = 20;
const AUTO_ADVANCE_MS = 4000;
const GAP_PX = 12;

const CAROUSEL_TRACK_CLASS =
  'flex gap-3 overflow-x-auto pt-1 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

function usePrefersReducedMotion() {
  const { reducedMotion } = useAccessibility();
  return reducedMotion;
}

export const RecentChecksCarousel = forwardRef(function RecentChecksCarousel(
  { checks, isLoading },
  ref,
) {
  const scrollRef = useRef(null);
  const pausedRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const displayChecks = useMemo(() => checks.slice(0, DISPLAY_LIMIT), [checks]);

  const loopChecks = useMemo(() => {
    if (displayChecks.length < 2) {
      return displayChecks;
    }

    return [...displayChecks, ...displayChecks];
  }, [displayChecks]);

  const getStepWidth = useCallback(() => {
    const container = scrollRef.current;
    if (!container?.firstElementChild) {
      return 192;
    }

    const card = container.firstElementChild;
    return card.getBoundingClientRect().width + GAP_PX;
  }, []);

  const normalizeScrollPosition = useCallback(() => {
    const container = scrollRef.current;
    if (!container || displayChecks.length < 2) {
      return;
    }

    const halfWidth = container.scrollWidth / 2;

    if (container.scrollLeft >= halfWidth) {
      container.scrollLeft -= halfWidth;
    }
  }, [displayChecks.length]);

  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
  }, []);

  const pauseTemporarily = useCallback(() => {
    pause();

    window.setTimeout(() => {
      resume();
    }, AUTO_ADVANCE_MS * 2);
  }, [pause, resume]);

  const scrollStep = useCallback(
    (direction) => {
      const container = scrollRef.current;
      if (!container || displayChecks.length === 0) {
        return;
      }

      pauseTemporarily();

      const step = getStepWidth() * direction;
      const halfWidth = container.scrollWidth / 2;
      let target = container.scrollLeft + step;

      if (displayChecks.length >= 2) {
        if (target < 0) {
          container.scrollLeft += halfWidth;
          target = container.scrollLeft + step;
        } else if (target >= halfWidth) {
          target -= halfWidth;
        }
      }

      container.scrollTo({
        left: Math.max(0, target),
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    },
    [displayChecks.length, getStepWidth, pauseTemporarily, prefersReducedMotion],
  );

  useImperativeHandle(
    ref,
    () => ({
      scrollPrevious: () => scrollStep(-1),
      scrollNext: () => scrollStep(1),
    }),
    [scrollStep],
  );

  useEffect(() => {
    if (isLoading || displayChecks.length < 2 || prefersReducedMotion) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const container = scrollRef.current;
      if (!container || pausedRef.current) {
        return;
      }

      scrollStep(1);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(intervalId);
  }, [displayChecks.length, isLoading, prefersReducedMotion, scrollStep]);

  if (isLoading) {
    return (
      <div
        className={CAROUSEL_TRACK_CLASS}
        aria-busy="true"
        aria-label="Loading recent checks"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <RecentCheckCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (loopChecks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No recent platform checks yet.</p>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={CAROUSEL_TRACK_CLASS}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Recent weather checks"
      onScroll={normalizeScrollPosition}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          resume();
        }
      }}
      onTouchStart={pause}
      onTouchEnd={resume}
      onTouchCancel={resume}
    >
      {loopChecks.map((check, index) => (
        <RecentCheckCard
          key={`${check.lat}-${check.lon}-${check.fetchedAt}-${index}`}
          check={check}
        />
      ))}
    </div>
  );
});
