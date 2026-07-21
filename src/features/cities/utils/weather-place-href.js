import { buildCityId, slugify } from '@/lib/utils';

/**
 * Build a /weather/{slug} href with lat/lon query so unseeded places
 * (Near You, search) can hydrate the same CityDetailPage template.
 */
export function buildWeatherPlaceHref(place) {
  const name = place?.name ?? place?.cityName;
  if (!name) {
    return null;
  }

  const country = String(place.country ?? 'GB').toUpperCase();
  const slug = place.seoSlug ?? slugify(name);
  const params = new URLSearchParams();

  if (place.lat != null && Number.isFinite(Number(place.lat))) {
    params.set('lat', String(Number(place.lat)));
  }
  if (place.lon != null && Number.isFinite(Number(place.lon))) {
    params.set('lon', String(Number(place.lon)));
  }
  params.set('name', name);
  if (country) {
    params.set('country', country);
  }
  if (place.state) {
    params.set('state', place.state);
  }

  const query = params.toString();
  return query
    ? `/weather/${encodeURIComponent(slug)}?${query}`
    : `/weather/${encodeURIComponent(slug)}`;
}

export function buildCityDetailHref(place) {
  const name = place?.name ?? place?.cityName;
  const country = place?.country;
  const lat = place?.lat;
  if (!name || !country || lat == null) {
    return place?.cityId || place?.id
      ? `/city/${encodeURIComponent(place.cityId ?? place.id)}`
      : null;
  }

  const id = place.cityId ?? place.id ?? buildCityId(name, country, lat);
  return `/city/${encodeURIComponent(id)}`;
}
