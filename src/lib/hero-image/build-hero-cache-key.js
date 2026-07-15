/**
 * @param {{
 *   country?: string | null,
 *   city?: string | null,
 *   state?: string | null,
 *   lat?: number | null,
 *   lon?: number | null,
 *   weatherScene?: string | null,
 * }} region
 */
export function buildHeroCacheKey(region) {
  const country = region?.country?.trim().toLowerCase();

  if (!country) {
    return null;
  }

  const city = region.city?.trim().toLowerCase();
  const state = region.state?.trim().toLowerCase();
  const lat = Number(region.lat);
  const latBucket = Number.isFinite(lat) ? lat.toFixed(1) : null;
  const scene = region.weatherScene?.trim()?.toLowerCase() || null;
  const sceneSuffix = scene ? `:scene:${scene}` : '';

  // v7: subject-quality filters (reject buses/maps/crests; prefer skylines)
  if (city && state) {
    return latBucket
      ? `v7:country:${country}:city:${city}:state:${state}:lat:${latBucket}${sceneSuffix}`
      : `v7:country:${country}:city:${city}:state:${state}${sceneSuffix}`;
  }

  if (city) {
    return latBucket
      ? `v7:country:${country}:city:${city}:lat:${latBucket}${sceneSuffix}`
      : `v7:country:${country}:city:${city}${sceneSuffix}`;
  }

  return `v7:country:${country}${sceneSuffix}`;
}
