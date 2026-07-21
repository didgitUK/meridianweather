'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CitySearch } from '@/features/cities/components/CitySearch';
import { HeroLocalWeatherCard } from '@/features/cities/components/HeroLocalWeatherCard';
import { useHomeLocationWeather } from '@/features/cities/hooks/useHomeLocationWeather';
import { DashboardHeroTitle } from '@/features/weather/components/DashboardHeroTitle';
import { DashboardHeroActions } from '@/features/weather/components/DashboardHeroActions';
import { HeroNearbyLocationsCarousel } from '@/features/weather/components/HeroNearbyLocationsCarousel';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

function SearchLocationIcon({ className }) {
  return (
    <Image
      src="/brand/whitewind.png"
      alt=""
      width={358}
      height={280}
      className={cn('h-9 w-auto shrink-0 object-contain sm:h-10', className)}
      aria-hidden
    />
  );
}

const HERO_CARD_SHELL =
  'relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.25rem] border border-border/70 bg-card/90 shadow-lg shadow-foreground/5 backdrop-blur-sm';

const HERO_CARD_GLOW =
  'absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-sky-200/50 via-transparent to-amber-100/40 opacity-80 dark:from-sky-900/40 dark:to-amber-950/20';

function HeroCardFrame({ children, className, glow = true, allowOverflow = false }) {
  return (
    <div className={cn('relative min-w-0', allowOverflow && 'z-40 overflow-visible')}>
      {glow ? <div className={HERO_CARD_GLOW} aria-hidden /> : null}
      <div
        className={cn(
          HERO_CARD_SHELL,
          allowOverflow && 'overflow-visible',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DashboardHero({ onCheckCity }) {
  const tBrand = useTranslations('Brand');
  const tHero = useTranslations('Dashboard.hero');
  const tCommon = useTranslations('Common');
  const tHeader = useTranslations('Header');
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
    <div className="flex flex-col items-center gap-8 overflow-visible text-center sm:gap-10">
      <div className="dashboard-hero__copy pointer-events-auto flex w-full max-w-3xl flex-col items-center gap-5 sm:gap-6">
        <div className="flex items-center justify-center gap-3">
          <span aria-hidden className="h-px w-8 shrink-0 bg-foreground/15 sm:w-10" />
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground sm:text-sm sm:tracking-[0.28em]">
            {tBrand('heroEyebrow')}
          </p>
          <span aria-hidden className="h-px w-8 shrink-0 bg-foreground/15 sm:w-10" />
        </div>
        <DashboardHeroTitle />
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-relaxed">
          {tBrand('heroIntro')}
        </p>
        <DashboardHeroActions />
      </div>

      <div className="flex w-full max-w-6xl flex-col gap-2 sm:gap-2.5">
      <div className="pointer-events-auto relative z-20 grid w-full grid-cols-1 items-stretch gap-4 overflow-visible sm:gap-5 md:grid-cols-2">
        <HeroCardFrame className="justify-start p-4 text-left sm:p-5">
          {showLocalCard ? (
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
          ) : (
            <div className="flex flex-1 flex-col justify-start gap-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {tCommon('nearYou')}
              </p>
              <p className={cn(TYPOGRAPHY.heading, 'text-xl sm:text-2xl')}>{tHero('shareLocationTitle')}</p>
              <p className="text-sm text-muted-foreground">
                {tHero('shareLocationBody')}
              </p>
            </div>
          )}
        </HeroCardFrame>

        <HeroCardFrame
          allowOverflow
          className="!bg-black border-neutral-800 p-5 !text-white shadow-none sm:p-6"
        >
          <div className="flex h-full flex-col items-center justify-center gap-4 overflow-visible text-center text-white sm:gap-5">
            <SearchLocationIcon className="h-12 w-auto sm:h-14" />
            <p className={cn(TYPOGRAPHY.heading, 'text-2xl !text-white sm:text-3xl')}>
              {tHero('searchCardTitle')}
            </p>
            <div className="relative z-50 w-full max-w-md overflow-visible text-left">
              <CitySearch
                onSelect={onCheckCity}
                variant="hero"
                actionLabel={tHeader('checkAction')}
                hideLocationHint
              />
            </div>
          </div>
        </HeroCardFrame>
      </div>

      <HeroNearbyLocationsCarousel className="w-full" />
      </div>
    </div>
  );
}
