import { createReverseGeocodeLookup } from '@/lib/geocode-reverse';
import { getCountryLabel } from '@/lib/geo/country-labels';
import { lookupEgressIpGeolocation, lookupIpGeolocation } from '@/lib/geo/ip-geolocation';
import {
  getClientIpFromHeaders,
  getClientIpFromRequest,
  getRegionHintFromHeaders,
  getRegionHintFromRequest,
} from '@/lib/geo/region-from-request';

const reverseGeocodeLookup = createReverseGeocodeLookup();

function buildRegionLabel(hint) {
  if (hint.city?.trim()) {
    return hint.city.trim();
  }

  if (hint.label?.trim()) {
    return hint.label.trim();
  }

  return getCountryLabel(hint.country);
}

function readRegionHint(input) {
  if (input instanceof Request) {
    return getRegionHintFromRequest(input);
  }

  if (input?.headers) {
    return getRegionHintFromHeaders(input.headers);
  }

  return null;
}

function readClientIp(input) {
  if (input instanceof Request) {
    return getClientIpFromRequest(input);
  }

  if (input?.headers) {
    return getClientIpFromHeaders(input.headers);
  }

  return input?.ip ?? null;
}

/**
 * @param {Request | { headers: Headers, ip?: string | null }} input
 */
export async function resolveRegionHint(input) {
  let nextHint = readRegionHint(input);

  if (!nextHint?.country || nextHint.lat == null || nextHint.lon == null) {
    const ip = readClientIp(input);
    const ipGeo = ip ? await lookupIpGeolocation(ip) : null;

    if (ipGeo) {
      nextHint = {
        ...nextHint,
        ...ipGeo,
        source: 'ip',
      };
    } else if (process.env.NODE_ENV === 'development') {
      const devGeo = await lookupEgressIpGeolocation();

      if (devGeo) {
        nextHint = {
          ...nextHint,
          ...devGeo,
          source: 'ip',
        };
      }
    }
  }

  if (!nextHint?.country) {
    return null;
  }

  if (!nextHint.city && nextHint.lat != null && nextHint.lon != null) {
    const reverse = await reverseGeocodeLookup(nextHint.lat, nextHint.lon);

    if (reverse?.name) {
      nextHint = {
        ...nextHint,
        city: reverse.local_names?.en ?? reverse.name,
      };
    }
  }

  return {
    ...nextHint,
    label: buildRegionLabel(nextHint),
  };
}
