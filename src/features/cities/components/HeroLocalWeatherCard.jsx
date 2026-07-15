'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { WrongLocationDialog } from '@/features/cities/components/WrongLocationDialog';
import { countryCodeToFlagEmoji } from '@/features/cities/utils/city-search';
import { ICONS, TOUCH, TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function HeroLocalWeatherCard({
  city,
  weather,
  displayLabel,
  sourceLabel,
  isLoading,
  error,
  hasCoordinates = false,
  onOpenCity,
  onConfirmLocation,
}) {
  const t = useTranslations('Dashboard.localCard');
  const tCommon = useTranslations('Common');
  const { formatTemp } = useTemperatureUnit();
  const [wrongLocationOpen, setWrongLocationOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col justify-center gap-3">
        <Skeleton className="h-3 w-20" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <Skeleton className="h-9 w-16" />
        </div>
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  if (error || !city || !weather) {
    if (!isLoading && (error || hasCoordinates)) {
      return (
        <>
          <div className="flex h-full flex-col justify-center gap-3 text-left">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {tCommon('nearYou')}
            </p>
            <p className="text-sm leading-snug text-muted-foreground">
              {displayLabel
                ? t('weatherLoadFailedNear', { label: displayLabel })
                : t('weatherLoadFailed')}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-fit px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={() => setWrongLocationOpen(true)}
            >
              {t('setLocation')}
            </Button>
          </div>

          <WrongLocationDialog
            open={wrongLocationOpen}
            onOpenChange={setWrongLocationOpen}
            onSelect={(selected) => {
              onConfirmLocation?.(selected);
              setWrongLocationOpen(false);
            }}
          />
        </>
      );
    }

    return null;
  }

  const locationLine = [city.state, city.country].filter(Boolean).join(', ');
  const basedOnLabel = sourceLabel
    ? tCommon('basedOn', { source: sourceLabel })
    : displayLabel
      ? tCommon('near', { label: displayLabel })
      : tCommon('localWeather');

  return (
    <>
      <div className="flex h-full flex-col text-left">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {tCommon('nearYou')}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 px-1.5 text-[0.65rem] text-muted-foreground hover:text-foreground"
            onClick={() => setWrongLocationOpen(true)}
          >
            {t('wrongLocation')}
          </Button>
        </div>

        <p className="mt-1 text-[0.7rem] leading-snug text-muted-foreground">
          {basedOnLabel}
        </p>

        <button
          type="button"
          onClick={() => onOpenCity?.(city)}
          className={cn(
            'mt-3 flex min-w-0 flex-1 flex-col rounded-lg text-left transition-colors',
            'hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
            TOUCH.minH,
          )}
        >
          <div className="flex items-center gap-3">
            {weather.icon ? (
              <WeatherIcon
                icon={weather.icon}
                alt={weather.description ?? tCommon('currentWeather')}
                size={44}
              />
            ) : (
              <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900/90 p-2 ring-1 ring-white/10">
                <MapPin className="size-7 text-white/80" aria-hidden />
              </span>
            )}
            <p className={cn(TYPOGRAPHY.heading, 'text-3xl tabular-nums leading-none')}>
              {formatTemp(weather.temperature)}
            </p>
          </div>

          <p className={cn(TYPOGRAPHY.heading, 'mt-3 truncate text-lg leading-tight')}>
            {city.name}
          </p>

          {locationLine ? (
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <span aria-hidden className="shrink-0">{countryCodeToFlagEmoji(city.country)}</span>
              <span className="truncate">{locationLine}</span>
            </p>
          ) : null}

          {weather.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
              {weather.description}
            </p>
          ) : null}

          <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-medium text-muted-foreground">
            {tCommon('open')}
            <ArrowRight className={ICONS.sm} aria-hidden />
          </span>
        </button>
      </div>

      <WrongLocationDialog
        open={wrongLocationOpen}
        onOpenChange={setWrongLocationOpen}
        onSelect={(selected) => {
          onConfirmLocation?.(selected);
          setWrongLocationOpen(false);
        }}
      />
    </>
  );
}
