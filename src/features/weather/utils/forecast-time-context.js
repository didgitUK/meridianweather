/**
 * @typedef {{ timezone: string, timezoneOffset: number | null }} TimeContext
 */

/**
 * @param {{ timezone?: string, timezoneOffset?: number | null }} input
 * @returns {TimeContext}
 */
export function createTimeContext({ timezone = 'UTC', timezoneOffset = null } = {}) {
  return {
    timezone,
    timezoneOffset: timezoneOffset ?? null,
  };
}

export function withTimeContext(timezone, timezoneOffset = null) {
  return createTimeContext({ timezone, timezoneOffset });
}
