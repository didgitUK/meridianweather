'use client';

import { useState } from 'react';
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
  const { formatTemp } = useTemperatureUnit();
  const [wrongLocationOpen, setWrongLocationOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/70 bg-background/70 p-4 sm:p-5">
        <Skeleton className="h-4 w-28" />
        <div className="mt-4 flex items-center gap-3">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !city || !weather) {
    if (!isLoading && (error || hasCoordinates)) {
      return (
        <>
          <div className="rounded-xl border border-border/70 bg-background/80 p-4 text-left sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Near you
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {displayLabel
                    ? `We think you are near ${displayLabel}, but local weather could not be loaded.`
                    : 'Local weather could not be loaded yet.'}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setWrongLocationOpen(true)}
              >
                Set location
              </Button>
            </div>
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

  return (
    <>
      <div className="rounded-xl border border-border/70 bg-background/80 p-4 text-left shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Near you
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {sourceLabel ? `Based on ${sourceLabel}` : displayLabel ? `Near ${displayLabel}` : 'Local weather'}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setWrongLocationOpen(true)}
          >
            Wrong location?
          </Button>
        </div>

        <button
          type="button"
          onClick={() => onOpenCity?.(city)}
          className={cn(
            'mt-4 flex w-full items-center gap-3 rounded-lg text-left transition-colors',
            'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
            TOUCH.minH,
          )}
        >
          {weather.icon ? (
            <WeatherIcon
              icon={weather.icon}
              alt={weather.description ?? 'Current weather'}
              size={56}
              className="size-12 shrink-0 sm:size-14"
            />
          ) : (
            <MapPin className="size-10 shrink-0 text-muted-foreground" aria-hidden />
          )}

          <div className="min-w-0 flex-1">
            <p className={cn(TYPOGRAPHY.heading, 'truncate text-xl sm:text-2xl')}>{city.name}</p>
            {locationLine ? (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <span aria-hidden>{countryCodeToFlagEmoji(city.country)}</span>
                <span className="truncate">{locationLine}</span>
              </p>
            ) : null}
            <p className="mt-1 text-sm text-muted-foreground">{weather.description}</p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <p className={cn(TYPOGRAPHY.heading, 'text-3xl tabular-nums')}>
              {formatTemp(weather.temperature)}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              Open
              <ArrowRight className={ICONS.sm} aria-hidden />
            </span>
          </div>
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
