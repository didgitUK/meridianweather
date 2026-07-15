'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BRAND } from '@/constants/brand';
import { cn } from '@/lib/utils';

const LOGO_SRC = '/brand/logo-on-dark.png';
const LOADER_BG = '#f7f7f7';

/** Soft route-level progress approaches this and holds until real stages take over. */
const ROUTE_PROGRESS_CAP = 0.86;

/**
 * Full-bleed branded page transition loader (city detail, locale routes, etc.).
 * Logo fill tracks `progress` (0–1). Stage copy follows `stageKey`.
 * When progress is omitted (Next.js route loading.js), soft progress caps below 100%.
 *
 * @param {{
 *   locationName?: string | null,
 *   progress?: number | null,
 *   stageKey?: string | null,
 *   className?: string,
 *   fullBleed?: boolean,
 * }} props
 */
export function CityDetailLoadingScreen({
  locationName = null,
  progress = null,
  stageKey = null,
  className,
  fullBleed = true,
}) {
  const t = useTranslations('CityDetail');
  const location = locationName?.trim() || '';
  const [softProgress, setSoftProgress] = useState(0.08);
  const controlled = Number.isFinite(progress);

  useEffect(() => {
    if (controlled) {
      return undefined;
    }

    const startedAt = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      // Ease toward cap; never reaches 100% without real completion.
      const next = Math.min(
        ROUTE_PROGRESS_CAP,
        0.08 + (ROUTE_PROGRESS_CAP - 0.08) * (1 - Math.exp(-elapsed / 2800)),
      );
      setSoftProgress(next);
    }, 120);

    return () => window.clearInterval(id);
  }, [controlled]);

  const resolvedProgress = Math.max(
    0,
    Math.min(1, controlled ? Number(progress) : softProgress),
  );

  const resolvedStageKey =
    stageKey
    || (location
      ? (resolvedProgress < 0.35
        ? 'loadingDataFor'
        : resolvedProgress < 0.55
          ? 'checkingAlerts'
          : resolvedProgress < 0.8
            ? 'formulatingCharts'
            : 'preparingForecast')
      : (resolvedProgress < 0.35
        ? 'loadingLocation'
        : resolvedProgress < 0.55
          ? 'checkingAlerts'
          : resolvedProgress < 0.8
            ? 'formulatingCharts'
            : 'preparingForecast'));

  const message =
    resolvedStageKey === 'loadingDataFor'
      ? t('loadingDataFor', { location })
      : t(resolvedStageKey);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(resolvedProgress * 100)}
      className={cn(
        'flex flex-col items-center justify-center gap-6 px-6 py-16',
        fullBleed
          ? 'fixed inset-x-0 bottom-0 top-[var(--site-header-height,4.5rem)] z-40 min-h-0'
          : 'min-h-[22rem] rounded-xl sm:min-h-[28rem]',
        className,
      )}
      style={{ backgroundColor: LOADER_BG }}
    >
      <div
        className="relative h-10 w-[11.5rem] sm:h-12 sm:w-[14rem]"
        aria-hidden="true"
        style={{ '--logo-progress': String(resolvedProgress) }}
      >
        <div
          className="absolute inset-0 bg-[#c8c8c8]"
          style={{
            WebkitMaskImage: `url(${LOGO_SRC})`,
            maskImage: `url(${LOGO_SRC})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
        <div
          className="city-detail-logo-fill absolute inset-0 bg-black"
          style={{
            WebkitMaskImage: `url(${LOGO_SRC})`,
            maskImage: `url(${LOGO_SRC})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      </div>

      <p className="max-w-sm text-center font-heading text-base tracking-tight text-neutral-700 sm:text-lg">
        <span className="sr-only">{BRAND.name}. </span>
        {message}
      </p>
    </div>
  );
}

/** Alias for reuse across route transitions beyond city detail. */
export const BrandLoadingScreen = CityDetailLoadingScreen;
