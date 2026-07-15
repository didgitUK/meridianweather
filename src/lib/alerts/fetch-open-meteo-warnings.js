/**
 * Open-Meteo warnings API — historically free/no key.
 * Upstream `/v1/warnings` currently returns 404 (API unavailable); callers get [].
 */

let loggedUpstreamUnavailable = false;

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Array<{ event: string, headline: string, severity: string, description: string, source: string }>>}
 */
export async function fetchOpenMeteoWarnings(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/warnings` +
    `?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lon)}`;

  let response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    });
  } catch {
    return [];
  }

  if (response.status === 404 || response.status === 410) {
    if (!loggedUpstreamUnavailable) {
      loggedUpstreamUnavailable = true;
      console.warn(
        'Open-Meteo Warnings API is unavailable (HTTP %s); returning no warnings.',
        response.status,
      );
    }
    return [];
  }

  if (!response.ok) {
    throw new Error(`Open-Meteo warnings failed (${response.status})`);
  }

  const payload = await response.json();
  const warnings = Array.isArray(payload?.warnings) ? payload.warnings : [];

  return warnings.map((warning) => ({
    event: warning.event ?? warning.event_en ?? '',
    headline: warning.headline ?? warning.headline_en ?? warning.event ?? '',
    severity: warning.severity ?? warning.awareness_level ?? '',
    description: warning.description ?? warning.description_en ?? '',
    source: 'open-meteo',
  }));
}
