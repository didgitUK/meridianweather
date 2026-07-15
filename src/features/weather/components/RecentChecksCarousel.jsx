'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { useTranslations } from 'next-intl';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import {
  RecentCheckCard,
  RecentCheckCardSkeleton,
} from '@/features/weather/components/RecentCheckCard';
import { cn } from '@/lib/utils';

const DISPLAY_LIMIT = 20;
const AUTO_ADVANCE_MS = 4000;
const GAP_PX = 12;
const DRAG_CLICK_THRESHOLD_PX = 6;

const CAROUSEL_TRACK_CLASS =
  'flex cursor-grab gap-3 overflow-x-auto pt-1 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing';

function usePrefersReducedMotion() {
  const { reducedMotion } = useAccessibility();
  return reducedMotion;
}

export const RecentChecksCarousel = forwardRef(function RecentChecksCarousel(
  { checks, isLoading, ariaLabel = null, emptyMessage = null },
  ref,
) {
  const t = useTranslations('Dashboard.recentChecks');
  const tCommon = useTranslations('Common');
  const resolvedAriaLabel = ariaLabel ?? t('carouselLabel');
  const resolvedEmpty = emptyMessage ?? t('empty');
  const scrollRef = useRef(null);
  const pausedRef = useRef(false);
  const dragRef = useRef({
    pointerId: null,
    startX: 0,
    startScroll: 0,
    moved: false,
  });
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

  const endDrag = useCallback((event) => {
    const drag = dragRef.current;
    if (drag.pointerId == null || drag.pointerId !== event.pointerId) {
      return;
    }

    const container = scrollRef.current;
    if (container?.hasPointerCapture?.(event.pointerId)) {
      container.releasePointerCapture(event.pointerId);
    }

    drag.pointerId = null;
    drag.captured = false;
    pauseTemporarily();
  }, [pauseTemporarily]);

  const onPointerDown = useCallback((event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) {
      return;
    }

    const container = scrollRef.current;
    if (!container) {
      return;
    }

    pause();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: container.scrollLeft,
      moved: false,
      captured: false,
    };

  }, [pause]);

  const onPointerMove = useCallback((event) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) {
      return;
    }

    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) >= DRAG_CLICK_THRESHOLD_PX) {
      // Capture only after a real drag so plain clicks still hit the card <Link>.
      if (!drag.captured) {
        drag.captured = true;
        drag.moved = true;
        container.setPointerCapture(event.pointerId);
      }
      container.scrollLeft = drag.startScroll - delta;
    }
  }, []);

  const onClickCapture = useCallback((event) => {

    if (!dragRef.current.moved) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dragRef.current.moved = false;
    dragRef.current.captured = false;
  }, []);

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
        aria-label={tCommon('loading')}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <RecentCheckCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (loopChecks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{resolvedEmpty}</p>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={cn(CAROUSEL_TRACK_CLASS, 'select-none')}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={resolvedAriaLabel}
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
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
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
