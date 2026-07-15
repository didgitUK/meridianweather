import { singleFlight } from '@/lib/client/single-flight';

/**
 * Shared client fetch for hero / ad placeholder backgrounds.
 * Concurrent identical query strings share one network request (and one
 * Unsplash/Pexels/Commons cascade on the server when uncached).
 *
 * @param {URLSearchParams | string} params
 * @returns {Promise<object | null>}
 */
export function fetchPlaceholderBg(params) {
  const query =
    typeof params === 'string'
      ? params
      : params instanceof URLSearchParams
        ? params.toString()
        : new URLSearchParams(params).toString();

  return singleFlight(`placeholder-bg:${query}`, async () => {
    const response = await fetch(`/api/ads/placeholder-bg?${query}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  });
}
