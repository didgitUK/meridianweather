/**
 * @param {boolean} includeHourly
 * @returns {string[]}
 */
export function resolveHomeWeatherScopes(includeHourly) {
  return includeHourly ? ['current', 'hourly'] : ['current'];
}
