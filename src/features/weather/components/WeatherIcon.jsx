'use client';

import Image from 'next/image';
import { getWeatherIconPath } from '@/features/weather/utils/weather-icon';
import { cn } from '@/lib/utils';

/**
 * Local Meteocons are light-filled SVGs — framed (default) puts them on a
 * dark chip so they stay readable on light cards and glass surfaces.
 * Pass framed={false} only when the icon already sits on a dark surface.
 */
export function WeatherIcon({
  icon,
  alt = '',
  size = 48,
  className = '',
  framed = true,
}) {
  if (!icon) {
    return null;
  }

  const image = (
    <Image
      src={getWeatherIconPath(icon)}
      alt={alt || 'Weather'}
      width={size}
      height={size}
      unoptimized
      className={cn('shrink-0', className)}
    />
  );

  if (!framed) {
    return image;
  }

  const chrome =
    size >= 56
      ? 'rounded-2xl p-2.5'
      : size >= 40
        ? 'rounded-2xl p-2'
        : 'rounded-xl p-1.5';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center bg-slate-900 shadow-sm ring-1 ring-white/15',
        chrome,
      )}
    >
      {image}
    </span>
  );
}
