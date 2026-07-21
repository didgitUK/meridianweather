'use client';

/**
 * Experimental city-header backdrop: Google Street View (no interaction).
 *
 * Prefer Maps Embed API when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set.
 * Without a key, falls back to the legacy svembed URL for local testing.
 *
 * Opt-in only (Google Maps billing). Set NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 to enable.
 * When unset, city headers prefer OpenStreetMap (see CityDetailOsmBackdrop).
 */

export { isCityHeroStreetViewEnabled } from '@/lib/city-hero-flags';

/**
 * @param {number} lat
 * @param {number} lon
 * @param {{ heading?: number, pitch?: number, fov?: number }} [opts]
 */
export function buildStreetViewEmbedUrl(lat, lon, opts = {}) {
  const heading = Number.isFinite(opts.heading) ? opts.heading : 160;
  const pitch = Number.isFinite(opts.pitch) ? opts.pitch : 0;
  const fov = Number.isFinite(opts.fov) ? opts.fov : 90;
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

  if (key) {
    const params = new URLSearchParams({
      key,
      location: `${lat},${lon}`,
      heading: String(heading),
      pitch: String(pitch),
      fov: String(fov),
    });
    return `https://www.google.com/maps/embed/v1/streetview?${params.toString()}`;
  }

  // Legacy Street View embed — works without Embed API key for smoke tests.
  const params = new URLSearchParams({
    layer: 'c',
    cbll: `${lat},${lon}`,
    cbp: `12,${heading},0,0,${pitch}`,
    ie: 'UTF8',
    output: 'svembed',
  });
  return `https://maps.google.com/maps?${params.toString()}`;
}

/**
 * @param {{
 *   lat: number,
 *   lon: number,
 *   title?: string,
 * }} props
 */
export function CityDetailStreetViewBackdrop({ lat, lon, title = 'Street View' }) {
  const src = buildStreetViewEmbedUrl(lat, lon);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* Scale past the iframe chrome so the default Google UI sits outside the crop. */}
      <iframe
        title={title}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allow="fullscreen; accelerometer; gyroscope"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[125%] w-[125%] max-w-none -translate-x-1/2 -translate-y-1/2 border-0"
        tabIndex={-1}
      />
      {/* Blocks any residual hit-targets and deepens contrast for title text. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
    </div>
  );
}
