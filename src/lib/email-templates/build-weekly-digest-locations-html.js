import { formatConditionLabel, formatTemperature } from '@/features/weather/utils/formatWeather';
import { escapeHtml } from '@/lib/email-templates/render-email-template';

/**
 * @param {Array<{ cityName: string, weather: object, unsubscribeUrl: string }>} locations
 * @returns {string}
 */
export function buildWeeklyDigestLocationsHtml(locations) {
  return locations
    .map((location) => {
      const cityName = escapeHtml(location.cityName || 'Unknown location');
      const temperature = escapeHtml(formatTemperature(location.weather?.temperature));
      const condition = escapeHtml(formatConditionLabel(location.weather?.condition));
      const humidity = escapeHtml(location.weather?.humidity ?? '—');
      const windSpeed = escapeHtml(location.weather?.windSpeed ?? '—');
      const unsubscribeUrl = escapeHtml(location.unsubscribeUrl);

      return `
      <div style="margin:20px 0;padding:16px 0;border-top:1px solid #e5e5e5;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:600;margin:0 0 8px;">${cityName}</p>
        <p style="font-family:Georgia,serif;margin:0 0 4px;">Current conditions: ${temperature} — ${condition}</p>
        <p style="font-family:Georgia,serif;margin:0 0 8px;">Humidity ${humidity}% · Wind ${windSpeed} m/s</p>
        <p style="font-family:Georgia,serif;font-size:12px;margin:0;">
          <a href="${unsubscribeUrl}">Stop digest for ${cityName}</a>
        </p>
      </div>`;
    })
    .join('\n');
}
