'use client';

import Image from 'next/image';
import { getWeatherIconPath } from '@/features/weather/utils/weather-icon';

export function WeatherIcon({
  icon,
  alt = '',
  size = 48,
  className = '',
}) {
  if (!icon) {
    return null;
  }

  return (
    <Image
      src={getWeatherIconPath(icon)}
      alt={alt || 'Weather'}
      width={size}
      height={size}
      unoptimized
      className={`shrink-0 ${className}`.trim()}
    />
  );
}
