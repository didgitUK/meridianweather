'use client';

import { Link } from '@/i18n/navigation';
import { useResolvedCity } from '@/features/cities/hooks/useResolvedCity';
import { useCityWeather } from '@/features/weather/hooks/useCityWeather';
import { useForecastDayExplorer } from '@/features/weather/hooks/useForecastDayExplorer';
import { CityDetailPageHeader } from '@/features/weather/components/CityDetailPageHeader';
import { CityDetailInaccurateReportBanner } from '@/features/weather/components/CityDetailInaccurateReportBanner';
import { CityDetailHero } from '@/features/weather/components/CityDetailHero';
import { useInaccurateReportStatus } from '@/features/weather/hooks/useInaccurateReportStatus';
import { MinutelyPrecipStrip } from '@/features/weather/components/MinutelyPrecipStrip';
import {
  ForecastHistoryExplorer,
  HeroForecastCarousel,
} from '@/features/weather/components/ForecastHistoryExplorer';
import { AlertBanner } from '@/features/weather/components/AlertBanner';
import { WeatherCardSkeleton } from '@/features/weather/components/WeatherCardSkeleton';
import { AdSlot } from '@/components/monetization/AdSlot';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function CityDetailPage({ cityId, initialCity = null, initialScopes = null }) {
  const { city, isHydrated, isPinned } = useResolvedCity(cityId, initialCity);
  const hasCoordinates = city?.lat != null && city?.lon != null;
  const { scopes, isLoading, error, refresh } = useCityWeather(
    hasCoordinates ? city : null,
    isHydrated,
    initialScopes,
  );
  const current = scopes.current?.data;
  const weatherError = error ?? scopes.current?.error ?? null;
  const timezone = current?.timezone ?? scopes.daily?.data?.timezone;
  const timezoneOffset = current?.timezoneOffset ?? scopes.daily?.data?.timezoneOffset ?? null;
  const hourlyPoints = scopes.hourly?.data?.points ?? [];
  const dailyPoints = scopes.daily?.data?.points ?? [];
  const forecastExplorer = useForecastDayExplorer({
    city: hasCoordinates ? city : null,
    isHydrated,
    hourlyPoints,
    dailyPoints,
    timezone,
    timezoneOffset,
  });
  const inaccurateReport = useInaccurateReportStatus(hasCoordinates ? city : null, isHydrated);

  async function handleReportInaccurate() {
    if (inaccurateReport.isActive) {
      toast.message('Our team is already reviewing this location');
      return;
    }

    try {
      await inaccurateReport.submitReport();
      toast.success('Report submitted. Our team will review this location.');
    } catch (error) {
      toast.error(error.message ?? 'Unable to submit report');
    }
  }

  if (!isHydrated) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!city || !hasCoordinates) {
    return (
      <section className="rounded-xl border border-dashed bg-card p-8 text-center">
        <h2 className="font-heading text-2xl">City not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Check a city from the dashboard search to view its forecast here.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex h-8 items-center justify-center rounded-lg border border-border px-2.5 text-sm hover:bg-muted"
        >
          Back to dashboard
        </Link>
      </section>
    );
  }

  if (isLoading && !scopes.current?.data && !weatherError) {
    return <WeatherCardSkeleton />;
  }

  const todayDay =
    forecastExplorer.dayEntries.find((day) => day.dateKey === forecastExplorer.todayKey) ?? null;

  return (
    <div className="flex flex-col gap-8">
      {inaccurateReport.isActive ? <CityDetailInaccurateReportBanner /> : null}

      <CityDetailPageHeader
        city={city}
        isPinned={isPinned}
        onRerunCheck={refresh}
        isRefreshing={isLoading}
        onReportInaccurate={handleReportInaccurate}
        isReportActive={inaccurateReport.isActive}
        isReporting={inaccurateReport.isSubmitting}
      />

      {weatherError && !current ? (
        <Alert>
          <AlertTitle>Couldn&apos;t load weather</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{weatherError}</span>
            <Button type="button" variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <CityDetailHero
        current={current}
        meta={scopes.current?.meta}
        hourlyPoints={hourlyPoints}
        todayDay={todayDay}
        dayCarousel={
          <HeroForecastCarousel
            days={forecastExplorer.dayEntries}
            todayKey={forecastExplorer.todayKey}
            timezone={timezone}
            timezoneOffset={timezoneOffset}
            selectedDateKey={forecastExplorer.activeDateKey}
            onSelectDay={forecastExplorer.setSelectedDateKey}
            range={forecastExplorer.forecastRange}
            onRangeChange={forecastExplorer.setForecastRange}
          />
        }
      />

      <ForecastHistoryExplorer
        timezone={timezone}
        {...forecastExplorer}
      />

      <AdSlot placement="city-detail" />

      <AlertBanner alertIds={current?.alertIds ?? []} />

      <MinutelyPrecipStrip
        points={scopes.minutely?.data?.points ?? []}
        timezone={timezone}
      />
    </div>
  );
}
