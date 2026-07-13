'use client';

import { useEffect, useRef, useState } from 'react';
import { RecentChecksCarousel } from '@/features/weather/components/RecentChecksCarousel';
import { RecentChecksCarouselControls } from '@/features/weather/components/RecentChecksCarouselControls';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';
import { fetchJson } from '@/lib/client/fetch-json';

export function RecentChecksSection({ initialChecks = null }) {
  const carouselRef = useRef(null);
  const hasServerChecks = Array.isArray(initialChecks);
  const [checks, setChecks] = useState(() => (hasServerChecks ? initialChecks : []));
  const [isLoading, setIsLoading] = useState(!hasServerChecks);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!hasServerChecks) {
        setIsLoading(true);
      }

      try {
        const payload = await fetchJson('/api/recent-checks');
        if (!cancelled) setChecks(payload.checks ?? []);
      } catch {
        if (!cancelled && !hasServerChecks) setChecks([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (!hasServerChecks) {
      void load();
    }

    function handleFocus() {
      void load();
    }

    window.addEventListener('focus', handleFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleFocus);
    };
  }, [hasServerChecks]);

  const controlsEnabled = !isLoading && checks.length >= 2;

  return (
    <section className={cn('flex flex-col', SPACING.stack4)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading)}>Recent checks</h2>
          <p className={TYPOGRAPHY.muted}>
            Cities checked recently across the platform.
          </p>
        </div>
        <RecentChecksCarouselControls
          disabled={!controlsEnabled}
          onPrevious={() => carouselRef.current?.scrollPrevious()}
          onNext={() => carouselRef.current?.scrollNext()}
        />
      </div>

      <RecentChecksCarousel ref={carouselRef} checks={checks} isLoading={isLoading} />
    </section>
  );
}
