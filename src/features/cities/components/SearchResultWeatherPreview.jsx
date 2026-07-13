'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';

export function SearchResultWeatherPreview({ preview }) {
  const { formatTemp } = useTemperatureUnit();

  if (!preview || (!preview.loading && !preview.data && !preview.error)) {
    return (
      <span className="min-w-[2.75rem] text-right text-xs text-muted-foreground sm:min-w-[3.5rem]" aria-hidden>
        —
      </span>
    );
  }

  if (preview.loading) {
    return (
      <div className="flex min-w-[2.75rem] items-center justify-end gap-1 sm:min-w-[3.5rem] sm:gap-1.5" aria-label="Loading weather">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-4 w-8" />
      </div>
    );
  }

  if (preview.error || !preview.data) {
    return (
      <span className="min-w-[2.75rem] text-right text-xs text-muted-foreground sm:min-w-[3.5rem]">—</span>
    );
  }

  return (
    <div
      className="flex min-w-[2.75rem] items-center justify-end gap-1 sm:min-w-[3.5rem] sm:gap-1.5"
      title={preview.data.description ?? undefined}
    >
      {preview.data.icon ? (
        <WeatherIcon
          icon={preview.data.icon}
          alt={preview.data.description ?? 'Current weather'}
          size={24}
        />
      ) : null}
      <span className="font-tabular text-sm">{formatTemp(preview.data.temperature)}</span>
    </div>
  );
}
