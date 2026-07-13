const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];

export function isPrivateIp(ip) {
  if (!ip?.trim()) {
    return true;
  }

  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip.trim()));
}

export async function lookupEgressIpGeolocation(deps = {}) {
  const fetchImpl = deps.fetchImpl ?? fetch;

  try {
    const response = await fetchImpl('https://ipwho.is/', {
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();

    if (!payload?.success || !payload.country_code) {
      return null;
    }

    const lat = Number(payload.latitude);
    const lon = Number(payload.longitude);

    return {
      country: String(payload.country_code).toUpperCase(),
      lat: Number.isFinite(lat) ? lat : null,
      lon: Number.isFinite(lon) ? lon : null,
      city: payload.city?.trim() || null,
      source: 'ip',
    };
  } catch {
    return null;
  }
}

export async function lookupIpGeolocation(ip, deps = {}) {
  const fetchImpl = deps.fetchImpl ?? fetch;

  if (isPrivateIp(ip)) {
    return null;
  }

  try {
    const response = await fetchImpl(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();

    if (!payload?.success || !payload.country_code) {
      return null;
    }

    const lat = Number(payload.latitude);
    const lon = Number(payload.longitude);

    return {
      country: String(payload.country_code).toUpperCase(),
      lat: Number.isFinite(lat) ? lat : null,
      lon: Number.isFinite(lon) ? lon : null,
      city: payload.city?.trim() || null,
      source: 'ip',
    };
  } catch {
    return null;
  }
}
