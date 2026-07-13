'use client';

import { useMemo, useState } from 'react';
import { useHasMounted } from '@/hooks/use-browser-storage';
import { useNow } from '@/hooks/use-now';
import { useCityHistory } from '@/features/weather/hooks/useCityHistory';
import { resolveDateKey } from '@/features/weather/utils/forecast-formatters';
import {
  buildDayChartPoints,
  buildForecastDayEntries,
  createTimeContext,
  groupObservationsByDay,
} from '@/features/weather/utils/forecast-explorer';

export function useForecastDayExplorer({
  city,
  isHydrated,
  hourlyPoints,
  dailyPoints,
  timezone,
  timezoneOffset = null,
}) {
  const isMounted = useHasMounted();
  const now = useNow();
  const [forecastRange, setForecastRange] = useState('week');
  const time = useMemo(
    () => createTimeContext({ timezone, timezoneOffset }),
    [timezone, timezoneOffset],
  );

  const todayKey = useMemo(() => {
    if (!isMounted) {
      return '';
    }

    return resolveDateKey(Math.floor(now / 1000), time.timezone, time.timezoneOffset);
  }, [isMounted, now, time]);

  const { history, isLoading, error } = useCityHistory(city, isHydrated, {
    forecastRange,
    todayKey,
  });
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  const observations = useMemo(() => history?.observations ?? [], [history?.observations]);
  const archivedDailyRows = useMemo(
    () => history?.forecasts?.daily ?? [],
    [history?.forecasts?.daily],
  );
  const archivedHourlyRows = useMemo(
    () => history?.forecasts?.hourly ?? [],
    [history?.forecasts?.hourly],
  );

  const dayEntries = useMemo(
    () =>
      buildForecastDayEntries({
        dailyPoints,
        hourlyPoints,
        archivedDailyRows,
        archivedHourlyRows,
        observations,
        time,
        todayKey,
      }),
    [
      dailyPoints,
      hourlyPoints,
      archivedDailyRows,
      archivedHourlyRows,
      observations,
      time,
      todayKey,
    ],
  );

  const activeDateKey = selectedDateKey ?? todayKey ?? dayEntries[0]?.dateKey ?? '';
  const activeDay = dayEntries.find((day) => day.dateKey === activeDateKey) ?? dayEntries[0] ?? null;
  const isForecastDay = Boolean(activeDay && activeDateKey >= todayKey);
  const observationDays = useMemo(
    () => groupObservationsByDay(observations, time),
    [observations, time],
  );

  const chartPoints = useMemo(() => {
    if (!activeDay) {
      return [];
    }

    return buildDayChartPoints({
      dateKey: activeDay.dateKey,
      time,
      hourlyPoints,
      archivedHourlyRows,
      observations,
      includeObservations: activeDay.dateKey <= todayKey,
    });
  }, [activeDay, hourlyPoints, archivedHourlyRows, observations, time, todayKey]);

  const activeObservations = activeDay ? observationDays.get(activeDay.dateKey) ?? [] : [];

  return {
    dayEntries,
    todayKey,
    activeDateKey,
    activeDay,
    setSelectedDateKey,
    chartPoints,
    isForecastDay,
    activeObservations,
    history,
    isLoading,
    error,
    forecastRange,
    setForecastRange,
    timezoneOffset: time.timezoneOffset,
  };
}
