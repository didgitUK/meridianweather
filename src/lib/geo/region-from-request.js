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
  const forwarded = readHeader(headers, ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip']);

  if (forwarded) {
    const firstHop = forwarded.split(',')[0]?.trim();
    if (firstHop) {
      return firstHop;
    }
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
