'use client';

import { Link } from '@/i18n/navigation';
import { useRouter } from 'next/navigation';
import { PinOff, ArrowRight } from 'lucide-react';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { DailyForecastStrip } from '@/features/weather/components/DailyForecastStrip';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { prefetchCityDetail } from '@/features/weather/hooks/useCityWeather';
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
import { TYPOGRAPHY, TOUCH, ICONS } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

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
  const { formatTemp } = useTemperatureUnit();

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
            <AlertTitle>Couldn&apos;t load weather</AlertTitle>
            <AlertDescription>{weatherState.error}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onRefreshCity?.(city) ?? onRetry?.()} disabled={isRefreshing}>
            Retry
          </Button>
          <Button variant="ghost" onClick={() => onRequestRemove(city)}>
            <PinOff className="size-4" aria-hidden />
            Unpin
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
        router.prefetch(`/city/${city.id}`);
        prefetchCityDetail(city);
      }}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 sm:gap-4">
        <Link href={`/city/${city.id}`} className="min-w-0 flex-1">
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
        <Link href={`/city/${city.id}`} className="flex items-center gap-3 sm:gap-4">
          {weather.icon ? (
            <WeatherIcon
              icon={weather.icon}
              alt={weather.description ?? 'Weather icon'}
              size={72}
              className="size-14 sm:size-16 md:size-[4.5rem]"
            />
          ) : null}
          <div className="min-w-0">
            <p className={cn(TYPOGRAPHY.metric, TYPOGRAPHY.heading)}>{formatTemp(weather.temperature)}</p>
            <p className="text-sm text-muted-foreground">{weather.description}</p>
          </div>
        </Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">7-day outlook</p>
          <div className="mt-2">
            <DailyForecastStrip
              forecast={forecastState?.data}
              timezone={weather.timezone}
              loading={forecastState?.loading ?? isLoading}
              error={forecastState?.error}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SubscribeModal city={city} />
        <Button
          variant="default"
          size="sm"
          nativeButton={false}
          className={cn(TOUCH.minH, 'w-full sm:w-auto')}
          render={<Link href={`/city/${city.id}`} />}
        >
          View full forecast
          <ArrowRight className={ICONS.sm} data-icon="inline-end" aria-hidden />
        </Button>
      </CardFooter>
    </Card>
  );
}
