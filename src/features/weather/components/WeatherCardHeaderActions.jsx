'use client';

import { PinOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeatherRefreshMode } from '@/providers/WeatherRefreshModeProvider';
import { cn } from '@/lib/utils';

export function WeatherCardHeaderActions({
  cityName,
  isRefreshing = false,
  onRefresh,
  onUnpin,
}) {
  const { isManual } = useWeatherRefreshMode();

  return (
    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
      {isManual ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Refresh ${cityName}`}
          disabled={isRefreshing}
          onClick={onRefresh}
          className="size-10 sm:size-8"
        >
          <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} aria-hidden />
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Unpin ${cityName}`}
        onClick={onUnpin}
        className="size-10 sm:size-8"
      >
        <PinOff className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
