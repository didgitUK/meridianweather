'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { HourlyForecastChart } from '@/features/weather/components/HourlyForecastChart';
import { selectNextHours } from '@/features/weather/utils/forecast-chart-series';

export function CityDetailHourlyPanel({ hourlyPoints, timezone }) {
  const t = useTranslations('CityDetail.hourly');
  const nextHours = useMemo(() => selectNextHours(hourlyPoints), [hourlyPoints]);

  return (
    <div className="flex flex-col gap-6">
      <HourlyForecastChart
        points={nextHours}
        timezone={timezone}
        layout="single"
        title={t('next12HoursTitle')}
        description={t('next12HoursDescription')}
        emptyMessage={t('next12HoursEmpty')}
      />
    </div>
  );
}
