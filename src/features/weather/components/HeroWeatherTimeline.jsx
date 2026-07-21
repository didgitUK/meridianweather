'use client';

import { useState } from 'react';
import { Pause, Play, Sunrise, Sunset } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatHourLabel } from '@/features/weather/utils/forecast-formatters';
import {
  buildHeroSolarMarkers,
  buildHeroTimelineLabels,
  timelineDtAtIndex,
} from '@/features/weather/utils/hero-weather-timeline';

/**
 * 24h scrub/play control for the dashboard hero map theater.
 * Shows current hour → +24h time labels along the track.
 * Supports continuous (float) scrubbing + sunrise/sunset markers.
 */
export function HeroWeatherTimeline({
  hours = [],
  hourIndex,
  playing,
  onScrub,
  onTogglePlaying,
  reducedMotion = false,
  timezone = null,
  timezoneOffset = null,
  sunrise = null,
  sunset = null,
  className,
}) {
  const hourCount = hours.length;
  const [dragging, setDragging] = useState(false);

  if (hourCount < 2) {
    return null;
  }

  const progress = hourCount > 1 ? hourIndex / (hourCount - 1) : 0;
  const formatHour = (dt) => formatHourLabel(dt, timezone, timezoneOffset);
  const labels = buildHeroTimelineLabels(hours, {
    timezone,
    timezoneOffset,
    formatHour,
  });
  const solarMarkers = buildHeroSolarMarkers(
    hours,
    { sunrise, sunset },
    { formatHour },
  );
  const activeDt = timelineDtAtIndex(hours, hourIndex);
  const activeLabel = Number.isFinite(activeDt)
    ? formatHourLabel(activeDt, timezone, timezoneOffset)
    : null;
  const ariaNow = Math.round(hourIndex);

  const handleScrub = (event) => {
    onScrub?.(Number(event.target.value));
  };

  return (
    <div
      className={cn(
        'dashboard-hero__weather-timeline pointer-events-auto absolute inset-x-0 bottom-0 z-20',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-page pb-4 pt-8 sm:pb-5">
        {reducedMotion ? null : (
          <button
            type="button"
            className="dashboard-hero__timeline-play inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label={playing ? 'Pause forecast animation' : 'Play forecast animation'}
            aria-pressed={playing}
            onClick={onTogglePlaying}
          >
            {playing ? (
              <Pause className="size-3.5 fill-current" aria-hidden />
            ) : (
              <Play className="size-3.5 fill-current" aria-hidden />
            )}
          </button>
        )}

        <div className="relative min-w-0 flex-1">
          <div className="dashboard-hero__timeline-track relative h-8">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/25" aria-hidden />
            <div
              className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-0.5"
              aria-hidden
            >
              {Array.from({ length: hourCount }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    'block w-px bg-white/35',
                    i % 6 === 0 ? 'h-2.5' : 'h-1.5',
                  )}
                />
              ))}
            </div>

            {solarMarkers.map((marker) => {
              const left = (marker.index / (hourCount - 1)) * 100;
              const Icon = marker.kind === 'sunrise' ? Sunrise : Sunset;
              return (
                <div
                  key={`${marker.kind}-${marker.dt}`}
                  className="pointer-events-none absolute top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${left}%` }}
                  title={`${marker.kind === 'sunrise' ? 'Sunrise' : 'Sunset'} ${marker.label}`}
                  aria-hidden
                >
                  <span className="flex flex-col items-center gap-0.5">
                    <Icon className="size-3.5 text-amber-200 drop-shadow-[0_0_4px_rgb(0_0_0_/0.55)]" />
                    <span className="h-2.5 w-px bg-amber-200/80" />
                  </span>
                </div>
              );
            })}

            <div
              className={cn(
                'dashboard-hero__timeline-playhead absolute top-1/2 z-[2] size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgb(0_0_0_/0.28)]',
                (playing || dragging) && 'dashboard-hero__timeline-playhead--playing',
                dragging && 'dashboard-hero__timeline-playhead--dragging',
              )}
              style={{ left: `${progress * 100}%` }}
              aria-hidden
            />

            <input
              type="range"
              className="dashboard-hero__timeline-range absolute inset-0 z-[3] h-full w-full cursor-pointer opacity-0"
              min={0}
              max={hourCount - 1}
              step="any"
              value={hourIndex}
              aria-label="Forecast hour"
              aria-valuemin={0}
              aria-valuemax={hourCount - 1}
              aria-valuenow={ariaNow}
              aria-valuetext={activeLabel ?? undefined}
              onPointerDown={() => setDragging(true)}
              onPointerUp={() => setDragging(false)}
              onPointerCancel={() => setDragging(false)}
              onInput={handleScrub}
              onChange={handleScrub}
            />
          </div>

          {activeLabel ? (
            <div className="relative mt-1 h-4" aria-hidden>
              <span
                className="absolute top-0 -translate-x-1/2 text-[0.7rem] font-medium tabular-nums tracking-wide text-white drop-shadow-[0_1px_2px_rgb(0_0_0_/0.55)]"
                style={{ left: `${progress * 100}%` }}
              >
                {activeLabel}
              </span>
            </div>
          ) : null}

          <div className="relative mt-1 h-8" aria-hidden>
            {labels.map((row) => {
              const left = hourCount > 1 ? (row.index / (hourCount - 1)) * 100 : 0;
              return (
                <span
                  key={`${row.index}-${row.label}`}
                  className="absolute top-0 -translate-x-1/2 text-[0.65rem] tabular-nums text-white/70"
                  style={{ left: `${left}%` }}
                >
                  {row.label}
                </span>
              );
            })}
            {solarMarkers.map((marker) => {
              const left = (marker.index / (hourCount - 1)) * 100;
              return (
                <span
                  key={`solar-label-${marker.kind}-${marker.dt}`}
                  className="absolute bottom-0 -translate-x-1/2 text-[0.6rem] font-medium tabular-nums text-amber-100/90"
                  style={{ left: `${left}%` }}
                >
                  {marker.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
