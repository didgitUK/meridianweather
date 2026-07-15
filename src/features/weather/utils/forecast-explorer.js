/**
 * Forecast explorer public API — split across day-model and chart-series.
 */
export {
  formatCarouselDayLabel,
  filterHourlyPointsForDay,
  groupObservationsByDay,
  dedupeArchivedDailyPoints,
  dedupeArchivedHourlyPoints,
  aggregateHourlyPointsToDaily,
  buildForecastDayEntries,
  shiftDateKey,
  filterDayEntriesByRange,
  expandDayEntriesForCalendarMonth,
  observationsToChartPoints,
  filterArchivedHourlyPointsForDay,
} from '@/features/weather/utils/forecast-day-model';

export {
  mergeChartPoints,
  densifyChartPoints,
  buildDayChartPoints,
  dayHasExpandableMetrics,
  buildChartAxisLabels,
  FORECAST_METRIC_TABS,
  getMetricValue,
  formatMetricValue,
  buildChartSeries,
} from '@/features/weather/utils/forecast-chart-series';

export { createTimeContext, withTimeContext } from '@/features/weather/utils/forecast-time-context';
