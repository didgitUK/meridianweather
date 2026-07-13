import { NextResponse } from 'next/server';
import { normalizeWeatherCheckTrigger } from '@/constants/weather-check-triggers';
import { fetchWeatherForScope } from '@/lib/weather-fetch-orchestrator';
import { parseLatLon, parseScope } from '@/lib/validators';
import { apiErrorFromCaught } from '@/lib/server/api-response';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { lat, lon } = parseLatLon(searchParams.get('lat'), searchParams.get('lon'));
    const scope = parseScope(searchParams.get('scope'));
    const trigger = normalizeWeatherCheckTrigger(searchParams.get('trigger'));
    const response = await fetchWeatherForScope(lat, lon, scope, { trigger });

    return NextResponse.json(
      {
        ...response.data,
        fetchedAt: response.meta.fetchedAt,
        cacheHit: response.meta.cacheLayer !== 'upstream',
        freshness: response.meta.freshness,
        source: response.meta.source,
        trigger: response.meta.trigger ?? trigger,
        tokensUsed: response.meta.tokensUsed ?? (response.meta.cacheLayer === 'upstream' ? 1 : 0),
      },
      { headers: { 'X-Cache': response.meta.cacheLayer } },
    );
  } catch (error) {
    return apiErrorFromCaught(error);
  }
}
