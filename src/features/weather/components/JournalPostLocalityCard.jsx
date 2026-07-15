'use client';

import { useTranslations } from 'next-intl';
import { HeroLocalWeatherCard } from '@/features/cities/components/HeroLocalWeatherCard';
import { useCheckCityNavigation } from '@/features/cities/hooks/useCheckCityNavigation';
import {
  HomeLocationWeatherProvider,
  useHomeLocationWeather,
} from '@/features/cities/hooks/useHomeLocationWeather';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

function JournalPostLocalityCardInner() {
  const t = useTranslations('Journal.post');
  const onCheckCity = useCheckCityNavigation();
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

  return (
    <section
      aria-labelledby="journal-locality-title"
      className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
    >
      <h2
        id="journal-locality-title"
        className={cn(TYPOGRAPHY.heading, 'mb-3 text-base')}
      >
        {t('localityTitle')}
      </h2>
      <div className="min-h-[8.5rem]">
        <HeroLocalWeatherCard
          city={city}
          weather={weather}
          displayLabel={displayLabel}
          sourceLabel={sourceLabel}
          isLoading={isLoading}
          error={error}
          hasCoordinates={hasCoordinates}
          onOpenCity={onCheckCity}
          onConfirmLocation={confirmHomeLocation}
        />
      </div>
    </section>
  );
}

export function JournalPostLocalityCard() {
  return (
    <HomeLocationWeatherProvider>
      <JournalPostLocalityCardInner />
    </HomeLocationWeatherProvider>
  );
}
