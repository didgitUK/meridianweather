function readHeader(headers, names) {
  for (const name of names) {
    const value = typeof headers?.get === 'function' ? headers.get(name) : null;

    if (value) {
      return value;
    }
  }

  return null;
}

function parseCoordinate(value) {
  if (value == null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getClientIpFromRequest(request) {
  return getClientIpFromHeaders(request.headers);
}

export function getClientIpFromHeaders(headers) {
  // Prefer headers set by the edge / CDN (not client-spoofable XFF first hop).
  const dedicated = readHeader(headers, ['cf-connecting-ip', 'x-real-ip', 'true-client-ip']);
  if (dedicated) {
    return dedicated.split(',')[0]?.trim() || null;
  }

  const forwarded = readHeader(headers, ['x-forwarded-for']);
  if (forwarded) {
    const hops = forwarded.split(',').map((part) => part.trim()).filter(Boolean);
    if (hops.length === 0) {
      return null;
    }
    // Rightmost hop is added by the nearest trusted proxy when proxies append.
    return hops[hops.length - 1] ?? null;
  }

  return null;
}

export function getRegionHintFromRequest(request) {
  return getRegionHintFromHeaders(request.headers);
}

export function getRegionHintFromHeaders(headers) {
  const country = readHeader(headers, [
    'cf-ipcountry',
    'x-vercel-ip-country',
    'cloudfront-viewer-country',
    'x-country-code',
  ])?.toUpperCase();

  const lat = parseCoordinate(
    readHeader(headers, ['cf-iplatitude', 'x-vercel-ip-latitude', 'cloudfront-viewer-latitude']),
  );
  const lon = parseCoordinate(
    readHeader(headers, ['cf-iplongitude', 'x-vercel-ip-longitude', 'cloudfront-viewer-longitude']),
  );

  if (!country || country === 'XX' || country === 'T1') {
    return null;
  }

  return {
    country,
    lat,
    lon,
    source: 'ip',
  };
}
