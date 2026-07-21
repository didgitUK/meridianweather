'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageSection } from '@/components/layout/PageSection';
import { RecentChecksSection } from '@/features/weather/components/RecentChecksSection';
import { HomeBlogSection } from '@/features/weather/components/HomeBlogSection';
import { RemoveCityDialog } from '@/features/cities/components/RemoveCityDialog';
import { useSavedCities } from '@/features/cities/hooks/useSavedCities';
import { useClientId } from '@/features/cities/hooks/useClientId';
import { useLocalSubscriptions } from '@/features/subscriptions/hooks/useLocalSubscriptions';
import { hasActiveCitySubscriptions } from '@/features/subscriptions/utils/subscription-state';
import { useWeatherData } from '@/features/weather/hooks/useWeatherData';
import { useCheckCityNavigation } from '@/features/cities/hooks/useCheckCityNavigation';
import { WeatherGrid } from '@/features/weather/components/WeatherGrid';
import {
  DASHBOARD_LOCATIONS_SECTION_ID,
  DASHBOARD_RECENT_CHECKS_SECTION_ID,
} from '@/features/weather/components/DashboardHeroActions';
import { SHOW_HOME_STRETCH_SECTIONS } from '@/constants/platform';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { singleFlight } from '@/lib/client/single-flight';
import { cn } from '@/lib/utils';

export function DashboardPage() {
  const t = useTranslations('Dashboard.locations');
  const tCommon = useTranslations('Common');
  const clientId = useClientId();
  const { savedCities, isHydrated, removeCity } = useSavedCities();
  const { registry, hydrateFromServer } = useLocalSubscriptions();
  const { weatherByCity, forecastByCity, isLoading, refreshingCityIds, refreshWeather, refreshCityWeather } =
    useWeatherData(savedCities, isHydrated);
  const [pendingCity, setPendingCity] = useState(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const handleCheckCity = useCheckCityNavigation();

  useEffect(() => {
    if (!clientId || !isHydrated) return;

    let cancelled = false;
    singleFlight(`subscriptions-hydrate:${clientId}`, async () => {
      const response = await fetch(
        `/api/subscriptions?clientId=${encodeURIComponent(clientId)}`,
      );
      if (!response.ok) {
        return null;
      }
      return response.json();
    })
      .then((payload) => {
        if (!cancelled && payload?.subscriptions) {
          hydrateFromServer(payload.subscriptions, savedCities);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [clientId, hydrateFromServer, isHydrated, savedCities]);

  const handleRequestRemove = useCallback(
    (city) => {
      if (hasActiveCitySubscriptions(registry, city.id)) {
        setPendingCity(city);
        setRemoveOpen(true);
        return;
      }
      removeCity(city.id);
    },
    [registry, removeCity],
  );

  if (!isHydrated) {
    return (
      <PageSection>
        <p className="text-sm text-muted-foreground">{tCommon('loadingLocations')}</p>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection>
        <section id={DASHBOARD_LOCATIONS_SECTION_ID} className={cn('flex scroll-mt-[calc(var(--site-header-height,4.5rem)+1rem)] flex-col', SPACING.stack6)}>
          <div>
            <h2 className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading)}>{t('title')}</h2>
          <p className={cn('mt-1', TYPOGRAPHY.muted)}>
            {t('description')}
          </p>
          </div>
          <WeatherGrid
            savedCities={savedCities}
            weatherByCity={weatherByCity}
            forecastByCity={forecastByCity}
            isLoading={isLoading}
            refreshingCityIds={refreshingCityIds}
            onRequestRemove={handleRequestRemove}
            onRefreshCity={refreshCityWeather}
            onRetry={refreshWeather}
            onCheckCity={handleCheckCity}
          />
        </section>
      </PageSection>

      <PageSection tone="muted">
        <section
          id={DASHBOARD_RECENT_CHECKS_SECTION_ID}
          className="scroll-mt-[calc(var(--site-header-height,4.5rem)+1rem)]"
        >
          <RecentChecksSection />
        </section>
      </PageSection>

      {SHOW_HOME_STRETCH_SECTIONS ? (
        <PageSection
          className="border-b-0 bg-[#f7f7f7] dark:bg-background"
          innerClassName="!pb-[calc(var(--space-section-block)*2)]"
        >
          <HomeBlogSection />
        </PageSection>
      ) : null}

      <RemoveCityDialog
        city={pendingCity}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        onRemoved={removeCity}
      />
    </>
  );
}
