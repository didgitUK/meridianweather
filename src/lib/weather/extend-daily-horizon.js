import { fetchOpenWeather, getApiKey } from '@/lib/api-client';
import { trackUpstreamCall } from '@/lib/api-usage-tracker';
import { normalizeWeatherResponse } from '@/lib/one-call';
import { fetchForecastDaily16Data } from '@/lib/weather-2-5-supplement';
import {
  TARGET_DAILY_FORECAST_DAYS,
  enumerateForwardDateKeys,
  localDayKeyFromDt,
  mergeDailyTimelinePoints,
  normalizeDaySummaryPoint,
  synthesizeExtendedDailyPoints,
} from '@/lib/weather/daily-horizon';

export {
  TARGET_DAILY_FORECAST_DAYS,
  enumerateForwardDateKeys,
  mergeDailyTimelinePoints,
  normalizeDaySummaryPoint,
  synthesizeExtendedDailyPoints,
} from '@/lib/weather/daily-horizon';

async function fetchDaySummary(lat, lon, date, usageMeta = {}) {
  const key = getApiKey();
  const url =
    `https://api.openweathermap.org/data/3.0/onecall/day_summary`
    + `?lat=${lat}&lon=${lon}&date=${date}&units=metric&appid=${key}`;

  const tracked = await trackUpstreamCall(
    'onecall_day_summary',
    () => fetchOpenWeather(url, { endpoint: 'onecall_day_summary' }),
    {
      lat,
      lon,
      reason: 'daily_horizon_extend',
      ...usageMeta,
    },
  );

  if (tracked.blocked) {
    return null;
  }

  return tracked.result?.data ?? null;
}

/**
 * Prefer real OpenWeather daily connectors; always finish at 10 days when possible.
 * Server-only — pulls API usage / SQLite via trackUpstreamCall.
 */
export async function extendDailyPayloadToHorizon(payload, lat, lon, usageMeta = {}, deps = {}) {
  const target = TARGET_DAILY_FORECAST_DAYS;
  const offset = payload?.timezoneOffset ?? 0;
  let points = Array.isArray(payload?.points) ? [...payload.points] : [];

  if (points.length >= target) {
    return {
      ...payload,
      points: points.slice(0, target),
    };
  }

  const loadDaily16 = deps.fetchForecastDaily16Data ?? fetchForecastDaily16Data;
  const loadDaySummary = deps.fetchDaySummary ?? fetchDaySummary;
  const lang = deps.lang ?? 'en';

  const daily16Data = await loadDaily16(lat, lon, usageMeta, lang).catch(() => null);
  if (daily16Data?.list?.length) {
    const normalized = normalizeWeatherResponse({
      scope: 'daily',
      data: daily16Data,
      lat,
      lon,
      source: 'forecast_2_5_daily_16',
    });
    points = mergeDailyTimelinePoints(points, normalized.points, offset);
  }

  if (points.length < target) {
    const haveKeys = new Set(points.map((point) => localDayKeyFromDt(point.dt, offset)));
    const startKey = points[0]
      ? localDayKeyFromDt(points[0].dt, offset)
      : localDayKeyFromDt(Math.floor(Date.now() / 1000), offset);
    const missingKeys = enumerateForwardDateKeys(startKey, target).filter((key) => !haveKeys.has(key));

    if (missingKeys.length > 0) {
      const summaries = await Promise.all(
        missingKeys.map((date) => loadDaySummary(lat, lon, date, usageMeta).catch(() => null)),
      );
      const summaryPoints = summaries
        .map((summary) => normalizeDaySummaryPoint(summary, offset))
        .filter(Boolean);

      points = mergeDailyTimelinePoints(points, summaryPoints, offset);
    }
  }

  const beforePad = points.length;
  points = synthesizeExtendedDailyPoints(points, offset, target);
  const usedExtension = points.length > beforePad || points.some((point) => point.isExtended);

  return {
    ...payload,
    points: points.slice(0, target),
    source: `${String(payload.source ?? 'daily').replace(/\+horizon$/, '')}+horizon`,
    extendedDayCount: usedExtension
      ? points.filter((point) => point.isExtended).length
      : 0,
  };
}
