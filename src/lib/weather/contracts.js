/**
 * Normalized weather payload contracts (JSDoc).
 * Validated lightly on write via `assertWeatherPayload`.
 */

/**
 * @typedef {Object} WeatherCurrent
 * @property {'current'} scope
 * @property {number} lat
 * @property {number} lon
 * @property {string | null} [timezone]
 * @property {number | null} [timezoneOffset]
 * @property {number | null} [temperature]
 * @property {number | null} [feelsLike]
 * @property {number | null} [weatherId]
 * @property {string | null} [condition]
 * @property {string | null} [description]
 * @property {string | null} [icon]
 * @property {string | null} [city]
 * @property {string | null} [country]
 * @property {string} [source]
 * @property {number | null} [updatedAt]
 */

/**
 * @typedef {Object} WeatherTimelinePoint
 * @property {number} dt
 * @property {number | null} [temp]
 * @property {number | null} [tempMin]
 * @property {number | null} [tempMax]
 * @property {number | null} [pop]
 * @property {string | null} [icon]
 * @property {string | null} [description]
 */

/**
 * @typedef {Object} WeatherTimeline
 * @property {'hourly' | 'daily' | 'minutely'} scope
 * @property {number} lat
 * @property {number} lon
 * @property {WeatherTimelinePoint[]} points
 * @property {string | null} [timezone]
 * @property {number | null} [timezoneOffset]
 * @property {string} [source]
 */

const TIMELINE_SCOPES = new Set(['hourly', 'daily', 'minutely']);

/**
 * Soft assert — throws only on clearly broken shapes before snapshot write.
 * @param {unknown} payload
 * @param {string} scope
 */
export function assertWeatherPayload(payload, scope) {
  if (!payload || typeof payload !== 'object') {
    throw new Error(`Invalid ${scope} weather payload`);
  }

  if (scope === 'current') {
    if (!('temperature' in payload) && !('updatedAt' in payload)) {
      throw new Error('Invalid current weather payload');
    }
    return;
  }

  if (TIMELINE_SCOPES.has(scope)) {
    if (!Array.isArray(payload.points)) {
      throw new Error(`Invalid ${scope} weather payload: points required`);
    }
  }
}
