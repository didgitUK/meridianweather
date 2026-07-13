'use client';

import { Building2 } from 'lucide-react';
import { CitySearch } from '@/features/cities/components/CitySearch';
import { HeroLocalWeatherCard } from '@/features/cities/components/HeroLocalWeatherCard';
import { useHomeLocationWeather } from '@/features/cities/hooks/useHomeLocationWeather';
import { DashboardHeroTitle } from '@/features/weather/components/DashboardHeroTitle';
import { DashboardHeroActions } from '@/features/weather/components/DashboardHeroActions';
import { ICONS, TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function DashboardHero({ onCheckCity }) {
  const {
    city,
    weather,
    displayLabel,
    sourceLabel,
    isLoading,
    error,
    hasCoordinates,
    confirmHomeLocation,
  } = useHomeLocationWeather();

  const showLocalCard = hasCoordinates || isLoading;

  function handleConfirmLocation(selected) {
    confirmHomeLocation(selected);
  }

  return (
    <div className="flex flex-col items-center gap-8 text-center sm:gap-10">
      <div className="flex w-full max-w-3xl flex-col items-center gap-5 sm:gap-6">
        <div className="flex items-center justify-center gap-3">
          <span aria-hidden className="h-px w-8 shrink-0 bg-foreground/15 sm:w-10" />
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground sm:text-sm sm:tracking-[0.28em]">
            Meridian Weather
          </p>
          <span aria-hidden className="h-px w-8 shrink-0 bg-foreground/15 sm:w-10" />
        </div>
        <DashboardHeroTitle />
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-relaxed">
          Check any city instantly, pin the ones you want to track, and get alerts when conditions change.
        </p>
        <DashboardHeroActions />
      </div>

      <div className="relative w-full max-w-xl">
        <div className="absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-sky-200/50 via-transparent to-amber-100/40 opacity-80 dark:from-sky-900/40 dark:to-amber-950/20" />
        <div className="relative overflow-visible rounded-[1.25rem] border border-border/70 bg-card/90 p-4 text-left shadow-lg shadow-foreground/5 backdrop-blur-sm sm:p-6 md:p-8">
          {showLocalCard ? (
            <div className="flex flex-col gap-5">
              <HeroLocalWeatherCard
                city={city}
                weather={weather}
                displayLabel={displayLabel}
                sourceLabel={sourceLabel}
                isLoading={isLoading}
                error={error}
                hasCoordinates={hasCoordinates}
                onOpenCity={onCheckCity}
                onConfirmLocation={handleConfirmLocation}
              />

              <div>
                <div className="mb-3 flex items-center gap-2.5 sm:mb-4 sm:gap-3">
                  <Building2 className={cn(ICONS.lg, 'text-foreground/85')} aria-hidden />
                  <p className={cn(TYPOGRAPHY.heading, 'text-xl sm:text-2xl')}>
                    Search another location
                  </p>
                </div>
                <CitySearch
                  onSelect={onCheckCity}
                  variant="hero"
                  actionLabel="Check"
                  hideLocationHint
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2.5 sm:mb-4 sm:gap-3">
                <Building2 className={cn(ICONS.lg, 'text-foreground/85')} aria-hidden />
                <p className={cn(TYPOGRAPHY.heading, 'text-2xl')}>Search A Location</p>
              </div>
              <CitySearch onSelect={onCheckCity} variant="hero" actionLabel="Check" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
