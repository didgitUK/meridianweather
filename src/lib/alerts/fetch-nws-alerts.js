/**
 * US National Weather Service active alerts — free, no API key.
 * Docs: https://www.weather.gov/documentation/services-web-api
 */

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Array<{ event: string, headline: string, severity: string, description: string, source: string }>>}
 */
export async function fetchNwsActiveAlerts(lat, lon) {
  const url = `https://api.weather.gov/alerts/active?point=${encodeURIComponent(lat)},${encodeURIComponent(lon)}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/geo+json',
      'User-Agent': 'meridian-weather (https://meridianweather.co.uk)',
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    // Outside the US, NWS often returns 404 / empty — treat as no alerts.
    if (response.status === 404 || response.status === 400) {
      return [];
    }
    throw new Error(`NWS alerts failed (${response.status})`);
  }

  const payload = await response.json();
  const features = Array.isArray(payload?.features) ? payload.features : [];

  return features.map((feature) => {
    const props = feature?.properties ?? {};
    return {
      event: props.event ?? '',
      headline: props.headline ?? props.event ?? '',
      severity: props.severity ?? props.urgency ?? '',
      description: props.description ?? '',
      source: 'nws',
    };
  });
}
