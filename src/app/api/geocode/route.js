import { NextResponse } from 'next/server';
import { fetchGeocode } from '@/lib/weather-fetch-orchestrator';
import { parseGeocodeContext, parseGeocodeQuery } from '@/lib/validators';
import { apiErrorFromCaught } from '@/lib/server/api-response';
import { enforceRateLimit } from '@/lib/server/rate-limit';

export async function GET(request) {
  const limited = enforceRateLimit(request, { bucket: 'geocode', limit: 60, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = parseGeocodeQuery(searchParams.get('q'));
    const context = parseGeocodeContext(searchParams);
    const response = await fetchGeocode(query, context);
    return NextResponse.json(response.data, {
      headers: { 'X-Cache': response.meta.cacheLayer },
    });
  } catch (error) {
    return apiErrorFromCaught(error);
  }
}
