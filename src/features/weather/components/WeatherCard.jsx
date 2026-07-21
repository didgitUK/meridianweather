'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { PinOff, ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { DailyForecastStrip } from '@/features/weather/components/DailyForecastStrip';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { prefetchCityDetail } from '@/features/weather/hooks/useCityWeather';
import { resolveOpenWeatherLang } from '@/i18n/locales';
import { SubscribeModal } from '@/features/subscriptions/components/SubscribeModal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WeatherCardHeaderActions } from '@/features/weather/components/WeatherCardHeaderActions';
import { WeatherCardSkeleton } from '@/features/weather/components/WeatherCardSkeleton';
import { countryCodeToFlagEmoji } from '@/features/cities/utils/city-search';
import { buildPlaceDetailHref } from '@/features/cities/utils/weather-place-href';
import { formatPercent, formatWind } from '@/features/weather/utils/forecast-formatters';
import { TYPOGRAPHY, TOUCH, ICONS } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';
import { WeatherFreshnessLabel } from '@/features/weather/components/WeatherFreshnessLabel';


function WeatherCardLocationLabel({ city }) {
  const locationLabel = [city.state, city.country].filter(Boolean).join(', ');

  if (!locationLabel) {
    return null;
  }

  return (
    <CardDescription className="flex items-center gap-2">
      <span className="text-base leading-none" aria-hidden>
        {countryCodeToFlagEmoji(city.country)}
      </span>
      <span>{locationLabel}</span>
    </CardDescription>
  );
}

export function WeatherCard({
  city,
  weatherState,
  forecastState,
  isLoading,
  isRefreshing = false,
  onRequestRemove,
  onRefreshCity,
  onRetry,
}) {
  const router = useRouter();
  const locale = useLocale();
  const weatherLang = resolveOpenWeatherLang(locale);
  const { formatTemp } = useTemperatureUnit();
  const t = useTranslations('Dashboard.weatherCard');
  const tCommon = useTranslations('Common');
  const detailHref = buildPlaceDetailHref(city) ?? `/city/${city.id}`;

  if (!weatherState || weatherState.loading) {
    return <WeatherCardSkeleton />;
  }

  if (weatherState.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{city.name}</CardTitle>
          <WeatherCardLocationLabel city={city} />
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>{t('loadFailedTitle')}</AlertTitle>
            <AlertDescription>{weatherState.error}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onRefreshCity?.(city) ?? onRetry?.()} disabled={isRefreshing}>
            {tCommon('retry')}
          </Button>
          <Button variant="ghost" onClick={() => onRequestRemove(city)}>
            <PinOff className="size-4" aria-hidden />
            {t('unpin')}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const weather = weatherState.data;

  return (
    <Card
      className="border-border/80 shadow-sm transition-shadow hover:shadow-md"
      onMouseEnter={() => {
        router.prefetch(detailHref);
        void prefetchCityDetail(city, weatherLang);
      }}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 sm:gap-4">
        <Link href={detailHref} className="min-w-0 flex-1">
          <CardTitle className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading, 'hover:underline')}>{city.name}</CardTitle>
          <WeatherCardLocationLabel city={city} />
        </Link>
        <WeatherCardHeaderActions
          cityName={city.name}
          isRefreshing={isRefreshing}
          onRefresh={() => onRefreshCity?.(city)}
          onUnpin={() => onRequestRemove(city)}
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {weatherState.meta?.offline ? (
          <Alert className="border-amber-500/40 bg-amber-500/5 py-2">
            <AlertDescription className="text-xs text-amber-800 dark:text-amber-300">
              {t('offlineBanner')}
            </AlertDescription>
          </Alert>
        ) : null}
        <Link href={detailHref} className="flex items-center gap-3 sm:gap-4">
          {weather.icon ? (
            <WeatherIcon
              icon={weather.icon}
              alt={weather.description ?? tCommon('weatherIcon')}
              size={72}
            />
          ) : null}
          <div className="min-w-0">
            <p className={cn(TYPOGRAPHY.metric, TYPOGRAPHY.heading)}>{formatTemp(weather.temperature)}</p>
            <p className="text-sm text-muted-foreground">{weather.description}</p>
            {weather.feelsLike != null ? (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {tCommon('feelsLike', { temp: formatTemp(weather.feelsLike) })}
              </p>
            ) : null}
            {weather.humidity != null || weather.windSpeedKmh != null ? (
              <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                {weather.humidity != null ? (
                  <span>
                    {t('humidity')}: {formatPercent(weather.humidity)}
                  </span>
                ) : null}
                {weather.windSpeedKmh != null ? (
                  <span>
                    {t('wind')}: {formatWind(weather.windSpeedKmh, weather.windDeg)}
                  </span>
                ) : null}
              </p>
            ) : null}
            <WeatherFreshnessLabel meta={weatherState.meta} />
          </div>
        </Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('sevenDayOutlook')}</p>
          <div className="mt-2">
            <DailyForecastStrip
              forecast={forecastState?.data}
              timezone={weather.timezone ?? forecastState?.data?.timezone}
              timezoneOffset={weather.timezoneOffset ?? forecastState?.data?.timezoneOffset}
              loading={forecastState?.loading ?? isLoading}
              error={forecastState?.error}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <SubscribeModal city={city} />
        <Button
          variant="default"
          size="sm"
          nativeButton={false}
          className={cn(TOUCH.minH, 'w-full sm:w-auto')}
          render={<Link href={detailHref} />}
        >
          {t('viewFullForecast')}
          <ArrowRight className={ICONS.sm} data-icon="inline-end" aria-hidden />
        </Button>
      </CardFooter>
    </Card>
  );
}
