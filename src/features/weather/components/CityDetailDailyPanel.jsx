'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { DailyForecastRow } from '@/features/weather/components/DailyForecastRow';
import { ForecastDayPanel } from '@/features/weather/components/forecast-explorer/ForecastDayPanel';
import { resolveDateKey } from '@/features/weather/utils/forecast-formatters';
import {
  buildDayChartPoints,
  createTimeContext,
  dayHasExpandableMetrics,
} from '@/features/weather/utils/forecast-explorer';

export function CityDetailDailyPanel({
  dailyPoints,
  timezone,
  timezoneOffset,
  selectedDateKey,
  onSelectDay,
  chartPoints,
  isForecastDay,
  activeObservations,
  hourlyPoints = [],
  archivedHourlyRows = [],
}) {
  const t = useTranslations('CityDetail.daily');
  const time = useMemo(
    () => createTimeContext({ timezone, timezoneOffset }),
    [timezone, timezoneOffset],
  );

  const rows = useMemo(
    () =>
      dailyPoints.map((point) => ({
        ...point,
        dateKey: resolveDateKey(point.dt, time.timezone, time.timezoneOffset),
      })),
    [dailyPoints, time],
  );

  const canExpandDay = useCallback(
    (point) => {
      if (!point?.dateKey || point.isExtended) {
        return false;
      }

      const dayChartPoints = buildDayChartPoints({
        dateKey: point.dateKey,
        time,
        hourlyPoints,
        archivedHourlyRows,
        observations: [],
        includeObservations: false,
      });

      return dayHasExpandableMetrics(dayChartPoints);
    },
    [archivedHourlyRows, hourlyPoints, time],
  );

  return (
    <DailyForecastRow
      points={rows}
      timezone={timezone}
      selectedDateKey={selectedDateKey}
      onSelectDay={onSelectDay}
      canExpandDay={canExpandDay}
      title={t('title')}
      description={t('description')}
      renderExpanded={() => (
        <ForecastDayPanel
          chartPoints={chartPoints}
          observations={activeObservations}
          timezone={timezone}
          timezoneOffset={timezoneOffset}
          isForecastDay={isForecastDay}
        />
      )}
    />
  );
}
