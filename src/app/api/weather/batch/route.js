import { NextResponse } from 'next/server';
import { normalizeWeatherCheckTrigger } from '@/constants/weather-check-triggers';
import { fetchWeatherBatch } from '@/lib/weather-fetch-orchestrator';
import { apiError, apiErrorFromCaught } from '@/lib/server/api-response';

export async function POST(request) {
  try {
    const body = await request.json();
    const cities = body.cities ?? [];
    const trigger = normalizeWeatherCheckTrigger(body.trigger);

    if (!Array.isArray(cities) || cities.length === 0) {
      return apiError('invalid_request', 'cities array is required', 400);
    }

    const response = await fetchWeatherBatch(cities, { trigger });
    return NextResponse.json(response);
  } catch (error) {
    return apiErrorFromCaught(error);
  }
}
