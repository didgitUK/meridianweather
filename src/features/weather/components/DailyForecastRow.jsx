'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  formatDayLabel,
  formatMoonPhase,
  formatPop,
  formatPrecipMm,
  formatUvi,
  formatWind,
} from '@/features/weather/utils/forecast-formatters';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { cn } from '@/lib/utils';

function DailyForecastSummary({ point, timezone, formatTempRange }) {
  return (
    <>
      <div className="grid min-w-0 flex-1 grid-cols-[4rem_2rem_1fr_auto] items-start gap-3">
        <span className="text-sm font-medium">{formatDayLabel(point.dt, timezone)}</span>
        {point.icon ? (
          <WeatherIcon icon={point.icon} alt={point.description ?? ''} size={32} />
        ) : (
          <span className="w-8" />
        )}
        <div className="min-w-0">
          <p className="text-sm">{point.description}</p>
          {point.summary ? (
            <p className="mt-1 text-xs text-muted-foreground">{point.summary}</p>
          ) : null}
          {point.condition ? (
            <p className="mt-1 text-xs text-muted-foreground">{point.condition}</p>
          ) : null}
        </div>
        <span className="font-tabular text-sm">{formatTempRange(point.tempMin, point.tempMax)}</span>
      </div>
      <div className="mt-2 flex w-full flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {formatPop(point.pop) ? <span>Rain chance {formatPop(point.pop)}</span> : null}
        {point.rain1h != null ? <span>Rain {formatPrecipMm(point.rain1h)}</span> : null}
        {point.snow1h != null ? <span>Snow {formatPrecipMm(point.snow1h)}</span> : null}
        {point.windSpeedKmh != null ? <span>{formatWind(point.windSpeedKmh, point.windDeg)}</span> : null}
        {point.windGustKmh != null ? <span>Gust {point.windGustKmh} km/h</span> : null}
        {point.uvi != null ? <span>UV {formatUvi(point.uvi)}</span> : null}
        {point.moonPhase != null ? <span>{formatMoonPhase(point.moonPhase)}</span> : null}
      </div>
    </>
  );
}

/**
 * @param {{
 *   points: object[],
 *   timezone?: string,
 *   selectedDateKey?: string | null,
 *   onSelectDay?: ((dateKey: string) => void) | null,
 *   renderExpanded?: ((point: object) => import('react').ReactNode) | null,
 *   canExpandDay?: ((point: object) => boolean) | null,
 *   title?: string,
 *   description?: string,
 * }} props
 */
export function DailyForecastRow({
  points,
  timezone,
  selectedDateKey = null,
  onSelectDay = null,
  renderExpanded = null,
  canExpandDay = null,
  title,
  description,
}) {
  const t = useTranslations('CityDetail.daily');
  const { formatTempRange } = useTemperatureUnit();
  const interactive = typeof onSelectDay === 'function';
  const [openKeys, setOpenKeys] = useState(() => (selectedDateKey ? [selectedDateKey] : []));
  const heading = title ?? t('title');
  const body = description ?? t('description');

  function isExpandable(point) {
    if (typeof canExpandDay === 'function') {
      return canExpandDay(point);
    }
    return Boolean(point.dateKey);
  }

  useEffect(() => {
    if (!selectedDateKey) {
      return;
    }

    const selected = points.find((point) => point.dateKey === selectedDateKey);
    if (selected && !isExpandable(selected)) {
      setOpenKeys([]);
      return;
    }

    setOpenKeys((prev) => (prev[0] === selectedDateKey ? prev : [selectedDateKey]));
    // isExpandable closes over canExpandDay/points — intentional for selection sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateKey, points, canExpandDay]);

  if (points.length === 0) {
    return (
      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-heading text-xl">{heading}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('unavailable')}</p>
      </section>
    );
  }

  if (!interactive) {
    return (
      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-heading text-xl">{heading}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        <ul className="mt-4 flex flex-col gap-3">
          {points.map((point) => (
            <li key={point.dt} className="rounded-lg border bg-muted/20 p-3">
              <DailyForecastSummary
                point={point}
                timezone={timezone}
                formatTempRange={formatTempRange}
              />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="font-heading text-xl">{heading}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {points.map((point) => {
          const dateKey = point.dateKey ?? null;
          const expandable = Boolean(dateKey) && isExpandable(point);

          if (!expandable) {
            return (
              <li key={point.dt} className="rounded-lg border bg-muted/20 p-3">
                <DailyForecastSummary
                  point={point}
                  timezone={timezone}
                  formatTempRange={formatTempRange}
                />
              </li>
            );
          }

          const isOpen = openKeys[0] === dateKey;

          return (
            <li key={point.dt}>
              <Accordion
                value={isOpen ? [dateKey] : []}
                onValueChange={(next) => {
                  setOpenKeys(next);
                  if (next[0]) {
                    onSelectDay(next[0]);
                  }
                }}
              >
                <AccordionItem
                  value={dateKey}
                  className={cn(
                    'rounded-lg border border-b px-3 last:border-b',
                    isOpen
                      ? 'border-primary/40 bg-muted shadow-sm'
                      : 'border-border bg-muted/20 hover:bg-muted/40',
                  )}
                >
                  <AccordionTrigger className="items-start py-3 font-sans text-foreground hover:text-foreground [&_svg]:mt-1">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <DailyForecastSummary
                        point={point}
                        timezone={timezone}
                        formatTempRange={formatTempRange}
                      />
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-0">
                    {isOpen && typeof renderExpanded === 'function' ? renderExpanded(point) : null}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
