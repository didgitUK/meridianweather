import { NextResponse } from 'next/server';
import { normalizeWeatherCheckTrigger } from '@/constants/weather-check-triggers';
import { normalizeOpenWeatherLang } from '@/i18n/locales';
import { fetchWeatherForScope } from '@/lib/weather-fetch-orchestrator';
import { parseLatLon, parseScope } from '@/lib/validators';
import { apiError, apiErrorFromCaught } from '@/lib/server/api-response';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { lat, lon } = parseLatLon(searchParams.get('lat'), searchParams.get('lon'));
    const scope = parseScope(searchParams.get('scope'));
    const trigger = normalizeWeatherCheckTrigger(searchParams.get('trigger'));
    const rawLang = searchParams.get('lang');
    const lang = normalizeOpenWeatherLang(rawLang);

    if (rawLang && !lang) {
      return apiError('invalid_request', 'Invalid lang', 400);
    }

    const response = await fetchWeatherForScope(lat, lon, scope, {
      trigger,
      ...(lang ? { lang } : {}),
    });

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
