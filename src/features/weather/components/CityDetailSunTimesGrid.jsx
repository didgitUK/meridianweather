'use client';

import { Sunrise, Sunset } from 'lucide-react';
import { formatSunTime } from '@/features/weather/utils/forecast-formatters';
import { MetricTile } from '@/features/weather/components/metrics/MetricTile';

const tileClassName = 'bg-card';

export function CityDetailSunTimesGrid({ current }) {
  if (!current) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <MetricTile className={tileClassName} icon={Sunrise} label="Sunrise" value={formatSunTime(current.sunrise, current.timezone)} />
      <MetricTile className={tileClassName} icon={Sunset} label="Sunset" value={formatSunTime(current.sunset, current.timezone)} />
    </div>
  );
}
