'use client';

import { Globe, MapPin } from 'lucide-react';
import {
  formatCoordinates,
  formatTimezoneLabel,
} from '@/features/weather/utils/forecast-formatters';
import { MetricTile } from '@/features/weather/components/metrics/MetricTile';

const tileClassName = 'bg-card';

export function CityDetailLocationGrid({ current }) {
  if (!current) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <MetricTile className={tileClassName} icon={MapPin} label="Coordinates" value={formatCoordinates(current.lat, current.lon)} />
      <MetricTile
        className={tileClassName}
        icon={Globe}
        label="Timezone"
        value={formatTimezoneLabel(current.timezone, current.timezoneOffset)}
      />
    </div>
  );
}
