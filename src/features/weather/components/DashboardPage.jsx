'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageSection } from '@/components/layout/PageSection';
import { RecentChecksSection } from '@/features/weather/components/RecentChecksSection';
import { RemoveCityDialog } from '@/features/cities/components/RemoveCityDialog';
import { useSavedCities } from '@/features/cities/hooks/useSavedCities';
import { useClientId } from '@/features/cities/hooks/useClientId';
import { useLocalSubscriptions } from '@/features/subscriptions/hooks/useLocalSubscriptions';
import { hasActiveCitySubscriptions } from '@/features/subscriptions/utils/subscription-state';
import { useWeatherData } from '@/features/weather/hooks/useWeatherData';
import { useCheckCityNavigation } from '@/features/cities/hooks/useCheckCityNavigation';
import { WeatherGrid } from '@/features/weather/components/WeatherGrid';
import { AdSlot } from '@/components/monetization/AdSlot';
import {
  DASHBOARD_LOCATIONS_SECTION_ID,
  DASHBOARD_RECENT_CHECKS_SECTION_ID,
} from '@/features/weather/components/DashboardHeroActions';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function DashboardPage({ initialRecentChecks = null }) {
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

    fetch(`/api/subscriptions?clientId=${encodeURIComponent(clientId)}`)
      .then((response) => response.json())
      .then((payload) => {
        if (payload.subscriptions) {
          hydrateFromServer(payload.subscriptions, savedCities);
        }
      })
      .catch(() => {});
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
        <p className="text-sm text-muted-foreground">Loading your locations…</p>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection tone="muted">
        <section
          id={DASHBOARD_RECENT_CHECKS_SECTION_ID}
          className="scroll-mt-[calc(var(--site-header-height,4.5rem)+1rem)]"
        >
          <RecentChecksSection initialChecks={initialRecentChecks} />
        </section>
      </PageSection>

      <PageSection className="border-b-0">
        <section id={DASHBOARD_LOCATIONS_SECTION_ID} className={cn('flex scroll-mt-[calc(var(--site-header-height,4.5rem)+1rem)] flex-col', SPACING.stack6)}>
          <div>
            <h2 className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading)}>Your locations</h2>
          <p className={cn('mt-1', TYPOGRAPHY.muted)}>
            Cities you have pinned from a check.
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

      <PageSection tone="muted" innerClassName="py-8 sm:py-10">
        <AdSlot placement="dashboard" />
      </PageSection>

      <RemoveCityDialog
        city={pendingCity}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        onRemoved={removeCity}
      />
    </>
  );
}
