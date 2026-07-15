'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useResolvedCity } from '@/features/cities/hooks/useResolvedCity';
import { useCityWeather } from '@/features/weather/hooks/useCityWeather';
import { useForecastDayExplorer } from '@/features/weather/hooks/useForecastDayExplorer';
import { CityDetailPageHeader } from '@/features/weather/components/CityDetailPageHeader';
import { CityDetailInaccurateReportBanner } from '@/features/weather/components/CityDetailInaccurateReportBanner';
import { CityDetailForecastTabs } from '@/features/weather/components/CityDetailForecastTabs';
import { CityDetailTodayPanel } from '@/features/weather/components/CityDetailTodayPanel';
import { CityDetailHourlyPanel } from '@/features/weather/components/CityDetailHourlyPanel';
import { CityDetailDailyPanel } from '@/features/weather/components/CityDetailDailyPanel';
import { useInaccurateReportStatus } from '@/features/weather/hooks/useInaccurateReportStatus';
import { ForecastHistoryExplorer } from '@/features/weather/components/ForecastHistoryExplorer';
import { AlertBanner } from '@/features/weather/components/AlertBanner';
import { CityDetailLoadingScreen } from '@/features/weather/components/CityDetailLoadingScreen';
import { AdSlot } from '@/components/monetization/AdSlot';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  CITY_DETAIL_DEFAULT_TAB,
  CITY_DETAIL_TAB_IDS,
  normalizeCityDetailTab,
} from '@/constants/city-detail';
import { AD_PLACEMENTS } from '@/constants/platform';
import {
  synthesizeExtendedDailyPoints,
  TARGET_DAILY_FORECAST_DAYS,
} from '@/lib/weather/daily-horizon';
import { toast } from 'sonner';

export function CityDetailPage({
  cityId,
  initialCity = null,
  initialScopes = null,
  heroImage = null,
}) {
  const t = useTranslations('CityDetail');
  const tCommon = useTranslations('Common');
  const tErrors = useTranslations('Errors');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { city, isHydrated, isPinned } = useResolvedCity(cityId, initialCity);
  const hasCoordinates = city?.lat != null && city?.lon != null;
  const { scopes, isLoading, error, refresh, loadProgress, loadStage } = useCityWeather(
    hasCoordinates ? city : null,
    isHydrated,
    initialScopes,
  );
  const current = scopes.current?.data;
  const weatherError = error ?? scopes.current?.error ?? null;
  const timezone = current?.timezone ?? scopes.daily?.data?.timezone;
  const timezoneOffset = current?.timezoneOffset ?? scopes.daily?.data?.timezoneOffset ?? null;
  const hourlyPoints = scopes.hourly?.data?.points ?? [];
  const dailyPoints = useMemo(() => {
    const points = scopes.daily?.data?.points ?? [];
    if (points.length >= TARGET_DAILY_FORECAST_DAYS) {
      return points.slice(0, TARGET_DAILY_FORECAST_DAYS);
    }
    return synthesizeExtendedDailyPoints(points, timezoneOffset ?? 0);
  }, [scopes.daily?.data?.points, timezoneOffset]);
  const forecastExplorer = useForecastDayExplorer({
    city: hasCoordinates ? city : null,
    isHydrated,
    hourlyPoints,
    dailyPoints,
    timezone,
    timezoneOffset,
  });
  const inaccurateReport = useInaccurateReportStatus(hasCoordinates ? city : null, isHydrated);

  const [activeTab, setActiveTab] = useState(CITY_DETAIL_DEFAULT_TAB);

  const {
    setSelectedDateKey,
    setForecastRange,
    dayEntries,
    todayKey,
    activeDateKey,
    chartPoints,
    isForecastDay,
    activeObservations,
  } = forecastExplorer;

  useEffect(() => {
    setActiveTab(normalizeCityDetailTab(searchParams.get('tab')));
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === CITY_DETAIL_TAB_IDS.history) {
      setForecastRange('month');
    }
  }, [activeTab, setForecastRange]);

  const handleTabChange = useCallback(
    (nextTab) => {
      const tab = normalizeCityDetailTab(nextTab);
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      if (tab === CITY_DETAIL_DEFAULT_TAB) {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  async function handleReportInaccurate() {
    if (inaccurateReport.isActive) {
      toast.message(tCommon('reportReviewing'));
      return;
    }

    try {
      await inaccurateReport.submitReport();
      toast.success(tCommon('reportSubmitted'));
    } catch (reportError) {
      toast.error(reportError.message ?? tErrors('unableToSubmitReport'));
    }
  }

  const todayDay = useMemo(
    () => dayEntries.find((day) => day.dateKey === todayKey) ?? null,
    [dayEntries, todayKey],
  );

  const futureDayEntries = useMemo(
    () =>
      dayEntries.filter(
        (day) => !day.isEmpty && day.dateKey && day.dateKey >= todayKey,
      ),
    [dayEntries, todayKey],
  );

  const loadingLocationName = city?.name || initialCity?.name || null;

  if (!isHydrated) {
    return (
      <CityDetailLoadingScreen
        locationName={loadingLocationName}
        progress={Math.max(0.18, loadProgress * 0.45)}
        stageKey={loadingLocationName ? 'loadingDataFor' : 'loadingLocation'}
      />
    );
  }

  if (!city || !hasCoordinates) {
    return (
      <section className="rounded-xl border border-dashed bg-card p-8 text-center">
        <h2 className="font-heading text-2xl">{t('notFoundTitle')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('notFoundBody')}
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex h-8 items-center justify-center rounded-lg border border-border px-2.5 text-sm hover:bg-muted"
        >
          {tCommon('backToDashboard')}
        </Link>
      </section>
    );
  }

  if (isLoading && !scopes.current?.data && !weatherError) {
    return (
      <CityDetailLoadingScreen
        locationName={loadingLocationName}
        progress={loadProgress}
        stageKey={loadStage}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {inaccurateReport.isActive ? <CityDetailInaccurateReportBanner /> : null}

      <AlertBanner alertIds={current?.alertIds ?? []} />

      <CityDetailPageHeader
        city={city}
        weather={current}
        isPinned={isPinned}
        onRerunCheck={refresh}
        isRefreshing={isLoading}
        onReportInaccurate={handleReportInaccurate}
        isReportActive={inaccurateReport.isActive}
        isReporting={inaccurateReport.isSubmitting}
        heroImage={heroImage}
      />

      {weatherError && !current ? (
        <Alert>
          <AlertTitle>{t('loadFailedTitle')}</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{weatherError}</span>
            <Button type="button" variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
              {tCommon('retry')}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <CityDetailForecastTabs activeTab={activeTab} onChange={handleTabChange} />

      <div className="max-h-[280px] overflow-hidden rounded-xl">
        <AdSlot
          placement={AD_PLACEMENTS.cityDetail}
          location={city ? { name: city.name, country: city.country } : null}
        />
      </div>

      <div
        role="tabpanel"
        id={`city-tabpanel-${activeTab}`}
        aria-labelledby={`city-tab-${activeTab}`}
        className="min-h-[12rem]"
      >
        {activeTab === CITY_DETAIL_TAB_IDS.today ? (
          <CityDetailTodayPanel
            current={current}
            meta={scopes.current?.meta}
            hourlyPoints={hourlyPoints}
            todayDay={todayDay}
            cityName={city?.name}
          />
        ) : null}

        {activeTab === CITY_DETAIL_TAB_IDS.hourly ? (
          <CityDetailHourlyPanel
            hourlyPoints={hourlyPoints}
            timezone={timezone}
          />
        ) : null}

        {activeTab === CITY_DETAIL_TAB_IDS.daily ? (
          <CityDetailDailyPanel
            dailyPoints={dailyPoints}
            timezone={timezone}
            timezoneOffset={timezoneOffset}
            selectedDateKey={activeDateKey}
            onSelectDay={setSelectedDateKey}
            chartPoints={chartPoints}
            isForecastDay={isForecastDay}
            activeObservations={activeObservations}
            hourlyPoints={hourlyPoints}
            archivedHourlyRows={forecastExplorer.history?.forecasts?.hourly ?? []}
          />
        ) : null}

        {activeTab === CITY_DETAIL_TAB_IDS.history ? (
          <ForecastHistoryExplorer
            timezone={timezone}
            onSelectDay={setSelectedDateKey}
            {...forecastExplorer}
          />
        ) : null}
      </div>
    </div>
  );
}
