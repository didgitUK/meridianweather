'use client';

import { WeatherCard } from '@/features/weather/components/WeatherCard';
import { WeatherGridEmptyState } from '@/features/weather/components/WeatherGridEmptyState';

export function WeatherGrid({
  savedCities,
  weatherByCity,
  forecastByCity,
  isLoading,
  refreshingCityIds = {},
  onRequestRemove,
  onRefreshCity,
  onRetry,
  onCheckCity,
}) {
  if (savedCities.length === 0) {
    return <WeatherGridEmptyState onCheckCity={onCheckCity} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {savedCities.map((city) => (
        <WeatherCard
          key={city.id}
          city={city}
          weatherState={
            weatherByCity[city.id] ?? (isLoading ? { loading: true } : { error: 'No data yet' })
          }
          forecastState={forecastByCity[city.id] ?? { loading: isLoading }}
          isLoading={isLoading}
          isRefreshing={Boolean(refreshingCityIds[city.id])}
          onRequestRemove={onRequestRemove}
          onRefreshCity={onRefreshCity}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}
