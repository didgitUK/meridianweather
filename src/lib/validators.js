export function parseGeocodeQuery(raw) {
  const query = raw?.trim() ?? '';
  if (query.length < 2) {
    throw new Error('Search query must be at least 2 characters');
  }
  if (query.length > 100) {
    throw new Error('Search query is too long');
  }
  return query;
}

export function parseLatLon(latRaw, lonRaw) {
  const lat = Number(latRaw);
  const lon = Number(lonRaw);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error('Invalid latitude');
  }

  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    throw new Error('Invalid longitude');
  }

  return { lat, lon };
}

export function parseGeocodeContext(searchParams) {
  const country = searchParams.get('country')?.trim().toUpperCase() ?? null;

  if (!country || country.length !== 2) {
    return null;
  }

  const latRaw = searchParams.get('lat');
  const lonRaw = searchParams.get('lon');

  if (latRaw == null || lonRaw == null || latRaw === '' || lonRaw === '') {
    return { country, lat: null, lon: null };
  }

  return {
    country,
    ...parseLatLon(latRaw, lonRaw),
  };
}

export function parseScope(scopeRaw) {
  const scope = scopeRaw || 'current';
  const allowed = new Set(['current', 'hourly', 'daily', 'minutely']);
  if (!allowed.has(scope)) {
    throw new Error('Invalid weather scope');
  }
  return scope;
}

export function parseIsoDate(raw, label = 'date') {
  if (raw == null || raw === '') {
    return null;
  }

  const parsed = Date.parse(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${label}`);
  }

  return new Date(parsed).toISOString();
}

export function parseHistoryLimit(raw) {
  if (raw == null || raw === '') {
    return 500;
  }

  const limit = Number(raw);
  if (!Number.isInteger(limit) || limit < 1 || limit > 5000) {
    throw new Error('Invalid history limit');
  }

  return limit;
}
