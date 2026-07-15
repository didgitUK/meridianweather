'use client';

import { useTranslations } from 'next-intl';
import { formatAge } from '@/lib/utils';
import { useNow } from '@/hooks/use-now';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { ForecastDayStats } from '@/features/weather/components/metrics/ForecastDayStats';
import { MetricTile } from '@/features/weather/components/metrics/MetricTile';
import { CityDetailHeroAccordions } from '@/features/weather/components/CityDetailHeroAccordions';
import {
  formatPercent,
  formatPressure,
  formatSunTime,
  formatVisibility,
} from '@/features/weather/utils/forecast-formatters';
import { METRIC_METEOCON } from '@/features/weather/utils/weather-icon';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

function formatLocalClock(timezone) {
  if (!timezone) {
    return null;
  }

  try {
    return new Date().toLocaleTimeString('en-GB', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    });
  } catch {
    return null;
  }
}

function CityDetailHeroGlance({ current }) {
  const t = useTranslations('CityDetail.metrics');
  const tHero = useTranslations('CityDetail.hero');
  const tiles = [
    {
      key: 'humidity',
      iconName: METRIC_METEOCON.humidity,
      label: t('humidity'),
      value: formatPercent(current.humidity),
    },
    {
      key: 'pressure',
      iconName: METRIC_METEOCON.pressure,
      label: t('pressure'),
      value: formatPressure(current.pressure),
    },
    {
      key: 'visibility',
      iconName: METRIC_METEOCON.visibility,
      label: t('visibility'),
      value: formatVisibility(current.visibility),
    },
    {
      key: 'clouds',
      iconName: METRIC_METEOCON.clouds,
      label: t('cloudCover'),
      value: formatPercent(current.clouds),
    },
    {
      key: 'sunrise',
      iconName: METRIC_METEOCON.sunrise,
      label: t('sunrise'),
      value: formatSunTime(current.sunrise, current.timezone),
    },
    {
      key: 'sunset',
      iconName: METRIC_METEOCON.sunset,
      label: t('sunset'),
      value: formatSunTime(current.sunset, current.timezone),
    },
  ].filter((tile) => tile.value && tile.value !== '—');

  if (tiles.length === 0) {
    return null;
  }

  return (
    <div className="min-w-0 w-full xl:max-w-[min(100%,28rem)] xl:flex-1">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {tHero('atAGlance')}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
        {tiles.map((tile) => (
          <MetricTile
            key={tile.key}
            iconName={tile.iconName}
            label={tile.label}
            value={tile.value}
            className="bg-muted/20"
          />
        ))}
      </div>
    </div>
  );
}

export function CityDetailHero({
  current,
  meta,
  todayDay = null,
  dayCarousel = null,
  hourlyPoints = [],
  cityName = null,
}) {
  const t = useTranslations('CityDetail.hero');
  const tCommon = useTranslations('Common');
  const now = useNow();
  const { formatTemp } = useTemperatureUnit();

  if (!current) return null;

  const updatedLabel = meta?.fetchedAt
    ? formatAge(now - Date.parse(meta.fetchedAt))
    : null;
  const localClock = formatLocalClock(current.timezone);
  const showGlance = !dayCarousel;
  const title = cityName
    ? t('title', { city: cityName })
    : t('titleFallback');

  return (
    <section className="rounded-xl border bg-card p-4 sm:p-6">
      <div className="flex flex-col gap-6 sm:gap-8 xl:flex-row xl:items-start xl:justify-between xl:gap-10">
        <div className="flex min-w-0 shrink-0 flex-col gap-3 xl:max-w-xl">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className={cn(TYPOGRAPHY.heading, 'text-xl')}>{title}</h2>
            {localClock ? (
              <p className="text-sm text-muted-foreground">Local {localClock}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5 md:gap-6">
            {current.icon ? (
              <WeatherIcon
                icon={current.icon}
                alt={current.description ?? tCommon('weatherIcon')}
                size={96}
                className="size-16 shrink-0 sm:size-20 md:size-24"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className={cn(TYPOGRAPHY.metricLg, TYPOGRAPHY.heading)}>{formatTemp(current.temperature)}</p>
              {todayDay?.tempMin != null && todayDay?.tempMax != null ? (
                <p className="mt-0.5 font-tabular text-sm text-muted-foreground">
                  {tCommon('highLow', {
                    high: formatTemp(todayDay.tempMax),
                    low: formatTemp(todayDay.tempMin),
                  })}
                </p>
              ) : null}
              <p className="mt-1 text-muted-foreground">{current.description}</p>
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

        {showGlance ? <CityDetailHeroGlance current={current} /> : null}
      </div>

      <CityDetailHeroAccordions current={current} hourlyPoints={hourlyPoints} />
    </section>
  );
}
