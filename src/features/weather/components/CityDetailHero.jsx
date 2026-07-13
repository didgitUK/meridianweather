'use client';

import { formatAge } from '@/lib/utils';
import { useNow } from '@/hooks/use-now';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { ForecastDayStats } from '@/features/weather/components/metrics/ForecastDayStats';
import { CityDetailHeroAccordions } from '@/features/weather/components/CityDetailHeroAccordions';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function CityDetailHero({ current, meta, todayDay = null, dayCarousel = null, hourlyPoints = [] }) {
  const now = useNow();
  const { formatTemp } = useTemperatureUnit();

  if (!current) return null;

  const updatedLabel = meta?.fetchedAt
    ? formatAge(now - Date.parse(meta.fetchedAt))
    : null;

  return (
    <section className="rounded-xl border bg-card p-4 sm:p-6">
      <div className="flex flex-col gap-6 sm:gap-8 xl:flex-row xl:items-center xl:justify-between xl:gap-14">
        <div className="flex min-w-0 shrink-0 flex-col gap-3">
          <h2 className={cn(TYPOGRAPHY.heading, 'text-xl')}>Today&apos;s Weather</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5 md:gap-6">
            {current.icon ? (
              <WeatherIcon
                icon={current.icon}
                alt={current.description ?? 'Weather icon'}
                size={96}
                className="size-16 shrink-0 sm:size-20 md:size-24"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className={cn(TYPOGRAPHY.metricLg, TYPOGRAPHY.heading)}>{formatTemp(current.temperature)}</p>
              <p className="text-muted-foreground">{current.description}</p>
              {current.condition ? (
                <p className="text-sm text-muted-foreground">{current.condition}</p>
              ) : null}
              {updatedLabel ? (
                <p className="mt-2 text-xs text-muted-foreground">Updated {updatedLabel}</p>
              ) : null}
            </div>
            <ForecastDayStats
              day={todayDay}
              current={current}
              isForecastDay
              className="border-l-0 border-t border-border/60 pt-4 pl-0 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0"
            />
          </div>
        </div>

        {dayCarousel ? (
          <div className="min-w-0 w-full xl:max-w-[min(100%,42rem)] xl:flex-1">{dayCarousel}</div>
        ) : null}
      </div>

      <CityDetailHeroAccordions current={current} hourlyPoints={hourlyPoints} />
    </section>
  );
}
