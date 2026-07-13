/**
 * @param {{ country?: string | null, city?: string | null }} region
 */
export function buildHeroCacheKey(region) {
  const country = region?.country?.trim().toLowerCase();

  if (!country) {
    return null;
  }

  const city = region.city?.trim().toLowerCase();

  if (city) {
    return `country:${country}:city:${city}`;
  }

  return `country:${country}`;
}
