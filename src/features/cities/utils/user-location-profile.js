import { STORAGE_KEYS } from '@/constants/storage-keys';
import { getCountryLabel } from '@/lib/geo/country-labels';
import { writeLocalStorageValue } from '@/hooks/use-browser-storage';

const SOURCE_PRIORITY = {
  confirmed: 4,
  gps: 3,
  history: 2,
  ip: 1,
};

function readProfileRaw() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.userLocation);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeProfile(profile) {
  writeLocalStorageValue(STORAGE_KEYS.userLocation, JSON.stringify(profile));
}

export function readUserLocationProfile() {
  return readProfileRaw();
}

export function recordLocationCheckForProfile(city) {
  if (!city?.country) {
    return readProfileRaw();
  }

  const rawProfile = readProfileRaw();
  const current = rawProfile ?? {};
  const existingCounts = current.countryCounts ?? {};

  const country = city.country.toUpperCase();
  const countryCounts = {
    ...existingCounts,
    [country]: (existingCounts[country] ?? 0) + 1,
  };

  const checks = [
    {
      country,
      lat: city.lat ?? null,
      lon: city.lon ?? null,
      at: new Date().toISOString(),
    },
    ...(current.checks ?? []),
  ].slice(0, 50);

  const next = {
    ...current,
    countryCounts,
    checks,
    updatedAt: new Date().toISOString(),
  };

  writeProfile(next);
  return next;
}

export function inferProfileFromHistory(profile = readProfileRaw()) {
  if (!profile?.countryCounts) {
    return null;
  }

  const entries = Object.entries(profile.countryCounts).sort((left, right) => right[1] - left[1]);
  const [topCountry, topCount] = entries[0] ?? [];
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (!topCountry || topCount < 2 || topCount / total < 0.5) {
    return null;
  }

  const matchingChecks = (profile.checks ?? []).filter(
    (check) => check.country === topCountry && check.lat != null && check.lon != null,
  );

  const lat = matchingChecks.length
    ? matchingChecks.reduce((sum, check) => sum + check.lat, 0) / matchingChecks.length
    : null;
  const lon = matchingChecks.length
    ? matchingChecks.reduce((sum, check) => sum + check.lon, 0) / matchingChecks.length
    : null;

  return {
    country: topCountry,
    lat,
    lon,
    label: getCountryLabel(topCountry),
    source: 'history',
  };
}

export function mergeUserLocationProfile(existing, incoming) {
  if (!incoming?.country) {
    return existing ?? null;
  }

  if (!existing?.country) {
    return {
      ...incoming,
      label: incoming.label ?? getCountryLabel(incoming.country),
      updatedAt: new Date().toISOString(),
    };
  }

  const existingPriority = SOURCE_PRIORITY[existing.source] ?? 0;
  const incomingPriority = SOURCE_PRIORITY[incoming.source] ?? 0;

  if (incomingPriority > existingPriority) {
    return {
      ...existing,
      ...incoming,
      label: incoming.label ?? getCountryLabel(incoming.country),
      updatedAt: new Date().toISOString(),
    };
  }

  if (incoming.source === 'history' && existing.source === 'ip') {
    return {
      ...existing,
      ...incoming,
      label: incoming.label ?? getCountryLabel(incoming.country),
      updatedAt: new Date().toISOString(),
    };
  }

  return existing;
}

export function saveUserLocationProfile(profile) {
  if (!profile?.country && (profile?.lat == null || profile?.lon == null)) {
    return null;
  }

  const stored = {
    ...readProfileRaw(),
    ...profile,
    country: profile.country ? profile.country.toUpperCase() : null,
    label: profile.label ?? (profile.country ? getCountryLabel(profile.country) : null),
    updatedAt: new Date().toISOString(),
  };

  writeProfile(stored);
  return stored;
}

export function writeUserLocationMeta(partial) {
  const current = readProfileRaw() ?? {};
  const next = {
    ...current,
    ...partial,
  };

  // Skip no-op writes — each write dispatches meridian:storage and can
  // re-trigger every mounted location/weather effect on the page.
  const keys = Object.keys(partial ?? {});
  const changed = keys.some((key) => {
    const before = current[key];
    const after = next[key];
    if (before === after) {
      return false;
    }
    if (
      typeof before === 'number'
      && typeof after === 'number'
      && Number.isFinite(before)
      && Number.isFinite(after)
    ) {
      return Math.abs(before - after) > 1e-6;
    }
    if (
      (before && typeof before === 'object')
      || (after && typeof after === 'object')
    ) {
      try {
        return JSON.stringify(before ?? null) !== JSON.stringify(after ?? null);
      } catch {
        return true;
      }
    }
    return String(before ?? '') !== String(after ?? '');
  });

  if (!changed) {
    return;
  }

  writeProfile({
    ...next,
    updatedAt: new Date().toISOString(),
  });
}

export function clearPreciseLocationFromProfile() {
  const current = readProfileRaw();
  if (!current || current.source !== 'gps') {
    return;
  }

  const next = { ...current };
  delete next.lat;
  delete next.lon;
  delete next.source;

  writeProfile(next);
}

export function saveConfirmedHomeLocation(city) {
  if (!city?.lat || !city?.lon || !city?.name || !city?.country) {
    return null;
  }

  return saveUserLocationProfile({
    ...readProfileRaw(),
    name: city.name,
    country: city.country,
    state: city.state ?? null,
    lat: city.lat,
    lon: city.lon,
    label: [city.name, city.state, city.country].filter(Boolean).join(', '),
    source: 'confirmed',
  });
}

export function resolveEffectiveLocationProfile(storedProfile = readProfileRaw()) {
  const ipHint = storedProfile?.ipHint ?? null;
  const historyProfile = inferProfileFromHistory(storedProfile);

  const candidates = [
    ipHint
      ? {
          country: ipHint.country,
          lat: ipHint.lat ?? null,
          lon: ipHint.lon ?? null,
          name: ipHint.city ?? null,
          label: ipHint.label ?? ipHint.city ?? getCountryLabel(ipHint.country),
          source: 'ip',
        }
      : null,
    historyProfile,
    storedProfile?.source === 'gps' ? storedProfile : null,
    storedProfile?.source === 'confirmed' ? storedProfile : null,
  ].filter(Boolean);

  return candidates.reduce((current, candidate) => mergeUserLocationProfile(current, candidate), null);
}

export function toGeocodeContext(profile) {
  if (!profile) {
    return null;
  }

  if (!profile.country && (profile.lat == null || profile.lon == null)) {
    return null;
  }

  return {
    country: profile.country ?? null,
    lat: profile.lat ?? null,
    lon: profile.lon ?? null,
  };
}
