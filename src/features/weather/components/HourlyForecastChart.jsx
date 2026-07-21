'use client';

import { useTranslations } from 'next-intl';
import {
  formatHourLabel,
  formatPop,
  formatPrecipMm,
  formatWind,
} from '@/features/weather/utils/forecast-formatters';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { cn } from '@/lib/utils';

function buildHourMeta(point, formatTemp) {
  const parts = [];

  if (point.feelsLike != null) {
    parts.push(`Feels ${formatTemp(point.feelsLike)}`);
  }

  if (formatPop(point.pop)) {
    parts.push(`${formatPop(point.pop)} rain`);
  }

  if (point.rain1h != null) {
    parts.push(`Rain ${formatPrecipMm(point.rain1h)}`);
  }

  if (point.snow1h != null) {
    parts.push(`Snow ${formatPrecipMm(point.snow1h)}`);
  }

  if (point.windSpeedKmh != null) {
    parts.push(formatWind(point.windSpeedKmh, point.windDeg));
  }

  return parts.join(' · ');
}

function formatGust(value) {
  if (value == null) {
    return null;
  }

  const speed = Number(value);
  if (!Number.isFinite(speed)) {
    return null;
  }

  return `Gust ${speed.toFixed(2)} km/h`;
}

export function HourlyForecastChart({
  points,
  timezone,
  title,
  description,
  emptyMessage,
  /** @type {'auto' | 'single' | 'compact'} */
  layout = 'auto',
}) {
  const t = useTranslations('Forecast.hourly');
  const { formatTemp } = useTemperatureUnit();
  const heading = title ?? t('title');
  const body = description ?? t('description');
  const empty = emptyMessage ?? t('empty');
  const ordered = [...points].sort((a, b) => a.dt - b.dt);
  const resolvedLayout =
    layout === 'auto'
      ? ordered.length > 0 && ordered.length <= 12
        ? 'compact'
        : 'multi'
      : layout;

  if (ordered.length === 0) {
    return (
      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-heading text-xl">{heading}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border bg-card p-4 sm:p-6">
      <h2 className="font-heading text-xl">{heading}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>

      <ol className="sr-only">
        {ordered.map((point) => (
          <li key={`sr-${point.dt}`}>
            {formatHourLabel(point.dt, timezone)}
            {': '}
            {formatTemp(point.temp)}
            {point.description ? ` — ${point.description}` : ''}
            {buildHourMeta(point, formatTemp) ? ` — ${buildHourMeta(point, formatTemp)}` : ''}
          </li>
        ))}
      </ol>

      <div
        className={cn(
          'mt-4 grid gap-2',
          resolvedLayout === 'single' && 'grid-cols-1',
          resolvedLayout === 'compact' &&
            'grid-cols-1 sm:grid-cols-2 sm:grid-flow-col sm:grid-rows-6',
          resolvedLayout === 'multi' && 'grid-cols-1 sm:grid-cols-2',
        )}
        aria-hidden="true"
      >
        {ordered.map((point) => {
          const meta = buildHourMeta(point, formatTemp);
          const gustLabel = formatGust(point.windGustKmh);

          return (
            <div
              key={point.dt}
              className="flex min-w-0 items-center gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5"
            >
              <div className="flex w-12 shrink-0 flex-col">
                <span className="font-tabular text-xs font-medium text-muted-foreground">
                  {formatHourLabel(point.dt, timezone)}
                </span>
              </div>

              {point.icon ? (
                <WeatherIcon
                  icon={point.icon}
                  alt={point.description ?? ''}
                  size={32}
                  className="size-8 shrink-0"
                />
              ) : (
                <span className="size-8 shrink-0" aria-hidden />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-tabular text-base font-semibold leading-none">
                    {formatTemp(point.temp)}
                  </span>
                  {gustLabel ? (
                    <span className="truncate text-[11px] text-muted-foreground">{gustLabel}</span>
                  ) : null}
                </div>
                {meta ? (
                  <p className="mt-1 truncate text-xs text-muted-foreground">{meta}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
