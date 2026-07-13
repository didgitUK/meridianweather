'use client';

import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { ForecastMetricChart } from '@/features/weather/components/forecast-explorer/ForecastMetricChart';

function HistoryObservationList({ observations, timezone }) {
  const { formatTemp } = useTemperatureUnit();
  if (observations.length === 0) {
    return null;
  }

  return (
    <ul className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
      {observations.map((observation) => (
        <li
          key={`${observation.observedAt}-${observation.recordedAt}`}
          className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2"
        >
          <div className="flex items-center gap-3">
            {observation.icon ? (
              <WeatherIcon icon={observation.icon} alt={observation.description ?? ''} size={28} />
            ) : null}
            <div>
              <p className="text-sm">{observation.description ?? 'Observation'}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(observation.observedAt).toLocaleString('en-GB', {
                  timeZone: timezone ?? undefined,
                })}
              </p>
            </div>
          </div>
          <p className="font-tabular text-sm">{formatTemp(observation.temperature)}</p>
        </li>
      ))}
    </ul>
  );
}

export function ForecastDayPanel({
  chartPoints,
  observations,
  timezone,
  timezoneOffset = null,
  isForecastDay,
}) {
  return (
    <div className="flex flex-col gap-4">
      <ForecastMetricChart
        points={chartPoints}
        timezone={timezone}
        timezoneOffset={timezoneOffset}
        emptyMessage={
          isForecastDay
            ? 'No hourly forecast points for this day.'
            : 'No stored readings to chart for this day yet.'
        }
      />

      {!isForecastDay ? (
        <HistoryObservationList observations={observations} timezone={timezone} />
      ) : null}
    </div>
  );
}
