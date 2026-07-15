'use client';

/**
 * Colored Meteocons fill SVG (Bas Milius) for metric / detail tiles.
 * Uses a plain img (eager) so icons still load inside accordion panels that
 * mount or stay off-screen — next/image lazy-loading often never fires there.
 */
export function MeteoconIcon({
  name,
  alt = '',
  size = 28,
  className = '',
}) {
  if (!name) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static local SVG; eager load needed in accordions
    <img
      src={`/weather-icons/${name}.svg`}
      alt={alt}
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      className={`shrink-0 ${className}`.trim()}
      aria-hidden={alt ? undefined : true}
    />
  );
}
