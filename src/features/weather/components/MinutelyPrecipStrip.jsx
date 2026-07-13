'use client';

import { formatHourLabel, formatPrecipMm } from '@/features/weather/utils/forecast-formatters';

export function MinutelyPrecipStrip({ points, timezone }) {
  const slice = points.slice(0, 60);
  if (slice.length === 0) return null;

  const max = Math.max(...slice.map((point) => point.precipitation ?? 0), 0.1);

  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="font-heading text-xl">Minute forecast</h2>
      <p className="mt-1 text-sm text-muted-foreground">Precipitation intensity for the next 60 minutes.</p>
      <div className="mt-4 -mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex h-20 min-w-[18rem] items-end gap-px sm:min-w-0 sm:gap-0.5">
        {slice.map((point) => {
          const height = ((point.precipitation ?? 0) / max) * 100;

          return (
            <div
              key={point.dt}
              className="group relative flex-1"
              title={`${formatHourLabel(point.dt, timezone)} · ${formatPrecipMm(point.precipitation ?? 0)}`}
            >
              <div
                className="w-full rounded-t bg-primary/70"
                style={{ height: `${Math.max((height / 100) * 80, 3)}px` }}
              />
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}
