import {
  isRainAlertWeather,
  isSnowAlertWeather,
  isStormAlertWeather,
} from '@/constants/openweather-conditions';
import { ALERT_SOURCES, ALERT_TYPE_BY_ID } from '@/constants/alert-types';

const FOG_IDS = new Set([741, 701, 721]); // fog, mist, haze
const ICE_IDS = new Set([511, 611, 612, 613, 615, 616]); // freezing rain / sleet-ish

function iconPrefixFog(iconCode) {
  if (!iconCode) return false;
  const prefix = String(iconCode).replace('@2x', '').trim().toLowerCase().slice(0, 2);
  return prefix === '50';
}

/**
 * Evaluate OpenWeather-derived alert types from a current snapshot.
 * @param {object} weather
 * @param {number} [windThresholdMs]
 * @returns {Record<string, { active: boolean, label: string }>}
 */
export function evaluateOpenWeatherAlertMatches(weather, windThresholdMs = 15) {
  const weatherId = weather?.weatherId;
  const icon = weather?.icon;
  const windSpeed = Number(weather?.windSpeed);
  const temp = Number(weather?.temperature);

  return {
    rain: {
      active: isRainAlertWeather(weatherId, icon),
      label: weather?.description ?? 'Rain',
    },
    wind: {
      active: Number.isFinite(windSpeed) && windSpeed >= windThresholdMs,
      label: Number.isFinite(windSpeed) ? `Wind ${windSpeed} m/s` : 'Wind',
    },
    thunderstorm: {
      active: isStormAlertWeather(weatherId, icon),
      label: weather?.description ?? 'Thunderstorm',
    },
    snow: {
      active: isSnowAlertWeather(weatherId, icon),
      label: weather?.description ?? 'Snow',
    },
    fog: {
      active: FOG_IDS.has(Number(weatherId)) || iconPrefixFog(icon),
      label: weather?.description ?? 'Fog',
    },
    ice: {
      active: ICE_IDS.has(Number(weatherId)),
      label: weather?.description ?? 'Ice',
    },
    extreme_heat: {
      active: Number.isFinite(temp) && temp >= 35,
      label: Number.isFinite(temp) ? `Heat ${temp}°C` : 'Extreme heat',
    },
    lightning: {
      active: isStormAlertWeather(weatherId, icon),
      label: weather?.description ?? 'Lightning',
    },
  };
}

/**
 * Match official warning events (Open-Meteo / NWS) to subscriber alert type ids.
 * @param {Array<{ event?: string, headline?: string, severity?: string, description?: string, source: string }>} events
 * @returns {Record<string, { active: boolean, label: string }>}
 */
export function evaluateOfficialAlertMatches(events = []) {
  const matches = {};

  for (const type of Object.values(ALERT_TYPE_BY_ID)) {
    if (type.source === ALERT_SOURCES.openweather) continue;

    const hit = events.find((event) => eventMatchesType(event, type));
    matches[type.id] = hit
      ? {
          active: true,
          label: event.headline || event.event || type.label,
        }
      : { active: false, label: type.label };
  }

  return matches;
}

function eventMatchesType(event, type) {
  const haystack = [event.event, event.headline, event.description, event.severity]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (!haystack) return false;

  const hints = type.matchHints?.length ? type.matchHints : [type.label];
  return hints.some((hint) => haystack.includes(String(hint).toLowerCase()));
}

/**
 * Merge OpenWeather + official matches for cron evaluation.
 */
export function mergeAlertMatches(...matchSets) {
  const merged = {};
  for (const set of matchSets) {
    for (const [id, value] of Object.entries(set ?? {})) {
      if (value?.active) {
        merged[id] = value;
      } else if (!merged[id]) {
        merged[id] = value ?? { active: false, label: id };
      }
    }
  }
  return merged;
}
