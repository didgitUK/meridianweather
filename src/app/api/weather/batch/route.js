import { NextResponse } from 'next/server';
import {
  assertPublicWeatherApiTrigger,
  normalizeWeatherCheckTrigger,
} from '@/constants/weather-check-triggers';
import { normalizeOpenWeatherLang } from '@/i18n/locales';
import { fetchWeatherBatch } from '@/lib/weather-fetch-orchestrator';
import { apiError, apiErrorFromCaught } from '@/lib/server/api-response';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import { MAX_WEATHER_BATCH_CITIES, parseLatLon, parseScope } from '@/lib/validators';

export async function POST(request) {
  const limited = enforceRateLimit(request, { bucket: 'weather-batch', limit: 20, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  try {
    const body = await request.json();
    const cities = body.cities ?? [];
    const trigger = normalizeWeatherCheckTrigger(body.trigger);
    assertPublicWeatherApiTrigger(trigger);
    const lang = normalizeOpenWeatherLang(body.lang) ?? undefined;

    if (body.lang != null && body.lang !== '' && !lang) {
      return apiError('invalid_request', 'Invalid lang', 400);
    }

    if (!Array.isArray(cities) || cities.length === 0) {
      return apiError('invalid_request', 'cities array is required', 400);
    }

    if (cities.length > MAX_WEATHER_BATCH_CITIES) {
      return apiError(
        'invalid_request',
        `At most ${MAX_WEATHER_BATCH_CITIES} cities per batch`,
        400,
      );
    }

    const normalizedCities = cities.map((city) => {
      const { lat, lon } = parseLatLon(city?.lat, city?.lon);
      const scopes = Array.isArray(city?.scopes)
        ? city.scopes.map((scope) => parseScope(scope))
        : city?.scope != null
          ? [parseScope(city.scope)]
          : undefined;
      const cityLang = normalizeOpenWeatherLang(city?.lang) ?? lang;
      const cityTrigger = city?.trigger != null
        ? normalizeWeatherCheckTrigger(city.trigger)
        : undefined;
      if (cityTrigger) {
        assertPublicWeatherApiTrigger(cityTrigger);
      }
      return {
        ...city,
        lat,
        lon,
        ...(scopes ? { scopes } : {}),
        ...(cityLang ? { lang: cityLang } : {}),
        ...(cityTrigger ? { trigger: cityTrigger } : {}),
      };
    });

    const response = await fetchWeatherBatch(normalizedCities, { trigger, lang });
    return NextResponse.json(response);
  } catch (error) {
    return apiErrorFromCaught(error);
  }
}
