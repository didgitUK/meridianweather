/**
 * Public facade for weather fetch orchestration.
 * Implementation lives in `src/lib/weather/*`.
 */
import '@/lib/server/env';

export { fetchWeatherForScope, fetchWeatherBatch } from '@/lib/weather/fetch-scope';
export { fetchGeocode } from '@/lib/weather/geocode';
export { fetchAlert } from '@/lib/weather/alerts';
