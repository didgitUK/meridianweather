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

function formatDistanceKm(distanceKm) {
  if (distanceKm < 1) {
    return 'Less than 1 km away';
  }

  return `${Math.round(distanceKm)} km away`;
}

export function formatCitySubtitle(result, options = {}) {
  const { userContext } = options;
  const countryLabel = getCountryLabel(result.country) ?? result.country;
  const parts = [];

  if (result.county) {
    parts.push(result.county);
  } else if (result.state && result.state.toLowerCase() !== countryLabel?.toLowerCase()) {
    parts.push(result.state);
  }

  if (countryLabel) {
    parts.push(countryLabel);
  } else if (result.country) {
    parts.push(result.country);
  }

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
