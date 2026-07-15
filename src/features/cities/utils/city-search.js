import { getCountryLabel } from '@/lib/geo/country-labels';
import { haversineKm } from '@/lib/geo/distance';

export function countryCodeToFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) {
    return '🌍';
  }

  const code = countryCode.toUpperCase();

  return String.fromCodePoint(
    ...[...code].map((character) => 127397 + character.charCodeAt(0)),
  );
}

export function formatDistanceKm(distanceKm) {
  if (distanceKm < 1) {
    return 'Less than 1 km away';
  }

  return `${Math.round(distanceKm)} km away`;
}

function isSameLabel(left, right) {
  return Boolean(left && right && left.trim().toLowerCase() === right.trim().toLowerCase());
}

/**
 * Distinct region bits for disambiguating search hits (county → state → country).
 * @param {object} result
 * @param {{ locale?: string }} [options]
 * @returns {string[]}
 */
export function formatCityRegionParts(result, options = {}) {
  const countryLabel = getCountryLabel(result.country, options.locale) ?? result.country;
  const parts = [];

  if (result.county?.trim()) {
    parts.push(result.county.trim());
  }

  if (result.state?.trim() && !isSameLabel(result.state, countryLabel)) {
    const state = result.state.trim();
    if (!parts.some((part) => isSameLabel(part, state))) {
      parts.push(state);
    }
  }

  if (countryLabel) {
    parts.push(countryLabel);
  } else if (result.country) {
    parts.push(result.country);
  }

  return parts;
}

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {string}
 */
export function formatCoordinates(lat, lon) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return '';
  }

  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`;
}

/**
 * Static street map centered on lat/lon (Esri World Street Map export — no API key).
 * @param {number} lat
 * @param {number} lon
 * @param {{ width?: number, height?: number, padDeg?: number }} [options]
 * @returns {string | null}
 */
export function buildStreetMapPreviewUrl(lat, lon, options = {}) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const width = options.width ?? 480;
  const height = options.height ?? 280;
  const padDeg = options.padDeg ?? 0.08;
  const lonPad = padDeg / Math.max(0.25, Math.cos((lat * Math.PI) / 180));
  const params = new URLSearchParams({
    bbox: `${lon - lonPad},${lat - padDeg},${lon + lonPad},${lat + padDeg}`,
    bboxSR: '4326',
    imageSR: '4326',
    size: `${width},${height}`,
    format: 'png',
    transparent: 'false',
    f: 'image',
  });

  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/export?${params}`;
}

export function formatCitySubtitle(result, options = {}) {
  const { userContext, locale } = options;
  const parts = formatCityRegionParts(result, { locale });
  const hints = [];

  if (userContext?.lat != null && userContext?.lon != null) {
    hints.push(
      formatDistanceKm(
        haversineKm(userContext.lat, userContext.lon, result.lat, result.lon),
      ),
    );
  }

  const base = parts.join(', ');
  if (hints.length === 0) {
    return base;
  }

  if (!base) {
    return hints.join(' · ');
  }

  return `${base} · ${hints.join(' · ')}`;
}

export function formatCityResultLabel(result, options = {}) {
  const subtitle = formatCitySubtitle(result, options);
  return subtitle ? `${result.name}, ${subtitle}` : result.name;
}

export function buildSearchResultKey(result) {
  return `${result.lat},${result.lon}`;
}
