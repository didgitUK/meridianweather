import { NextResponse } from 'next/server';
import {
  getWeatherHistorySummary,
  listForecastArchive,
  listWeatherObservations,
} from '@/lib/weather-history-repo';
import { parseHistoryLimit, parseIsoDate, parseLatLon } from '@/lib/validators';
import { apiErrorFromCaught } from '@/lib/server/api-response';

const FORECAST_ARCHIVE_HORIZON_MS = 45 * 24 * 60 * 60 * 1000;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { lat, lon } = parseLatLon(searchParams.get('lat'), searchParams.get('lon'));
    const from = parseIsoDate(searchParams.get('from'), 'from date');
    const to = parseIsoDate(searchParams.get('to'), 'to date');
    const limit = parseHistoryLimit(searchParams.get('limit'));

    const observations = listWeatherObservations(lat, lon, { from, to, limit });
    const forecastArchiveTo =
      to ?? new Date(Date.now() + FORECAST_ARCHIVE_HORIZON_MS).toISOString();
    const hourlyArchive = listForecastArchive(lat, lon, 'hourly', {
      from,
      to: forecastArchiveTo,
      limit: limit * 2,
    });
    const dailyArchive = listForecastArchive(lat, lon, 'daily', {
      from,
      to: forecastArchiveTo,
      limit,
    });

    return NextResponse.json({
      summary: getWeatherHistorySummary(lat, lon),
      observations,
      forecasts: {
        hourly: hourlyArchive,
        daily: dailyArchive,
      },
    });
  } catch (error) {
    return apiErrorFromCaught(error);
  }
}
