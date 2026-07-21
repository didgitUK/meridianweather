'use client';

import Image from 'next/image';
import { getWeatherIconPath } from '@/features/weather/utils/weather-icon';
import { cn } from '@/lib/utils';

/**
 * Local Meteocons are light-filled SVGs — framed (default) puts them on a
 * dark chip so they stay readable on light cards and glass surfaces.
 * Pass framed={false} only when the icon already sits on a dark surface.
 *
 * `size` is the glyph box in CSS pixels (equal width and height).
 * The frame adds fixed pixel padding so the outer chip stays square too.
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

  const glyphPx = Math.max(1, Math.round(Number(size) || 48));
  const padPx = glyphPx >= 56 ? 10 : glyphPx >= 40 ? 8 : 6;
  const radiusPx = glyphPx >= 40 ? 16 : 12;
  const outerPx = glyphPx + padPx * 2;

  const image = (
    <Image
      src={getWeatherIconPath(icon)}
      alt={alt || 'Weather'}
      width={glyphPx}
      height={glyphPx}
      unoptimized
      className={cn('shrink-0 object-contain', !framed && className)}
      style={{ width: glyphPx, height: glyphPx }}
    />
  );

  if (!framed) {
    return image;
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center self-start bg-slate-900 shadow-sm ring-1 ring-white/15',
        className,
      )}
      style={{
        width: outerPx,
        height: outerPx,
        padding: padPx,
        borderRadius: radiusPx,
      }}
    >
      {image}
    </span>
  );
}
