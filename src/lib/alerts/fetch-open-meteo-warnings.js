/**
 * Open-Meteo warnings API — free, no key, global national agency feed.
 * Docs: https://open-meteo.com/en/docs/warnings-api
 */

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

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 0 },
  });

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
