'use client';

import {
  WEATHER_REFRESH_MODE_OPTIONS,
} from '@/constants/weather-refresh';
import { PreferenceSelect } from '@/components/layout/settings/PreferenceSelect';
import { useWeatherRefreshMode } from '@/providers/WeatherRefreshModeProvider';

export function WeatherPreferencesPanel() {
  const { mode, setMode } = useWeatherRefreshMode();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Control when weather data fetches fresh readings. Manual mode (default) keeps OpenWeather
        usage low and shows refresh buttons so you can update on demand. Refresh when page reloads
        updates locations automatically and hides manual refresh controls.
      </p>

      <PreferenceSelect
        id="weather-refresh-mode"
        label="Weather refresh"
        description="Manual only uses cached readings on load. Refresh when page reloads fetches fresh data each time you open the dashboard or a city page."
        value={mode}
        options={WEATHER_REFRESH_MODE_OPTIONS}
        onChange={setMode}
      />
    </div>
  );
}
