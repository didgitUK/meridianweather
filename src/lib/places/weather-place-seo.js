import { cache } from 'react';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { WEATHER_PLACE_SEO_MAX_AGE_MS } from '@/constants/weather-places';
import { fetchWeatherForScope } from '@/lib/weather-fetch-orchestrator';

const getPlaceWeatherForSeoByKey = cache(async (lat, lon, locale) => {
  try {
    const options = {
      lang: locale,
      trigger: WEATHER_CHECK_TRIGGERS.weatherPlaceSeo,
      maxAgeMs: WEATHER_PLACE_SEO_MAX_AGE_MS,
    };

    const [currentResponse, dailyResponse, hourlyResponse] = await Promise.all([
      fetchWeatherForScope(lat, lon, 'current', options),
      fetchWeatherForScope(lat, lon, 'daily', options),
      fetchWeatherForScope(lat, lon, 'hourly', options).catch(() => null),
    ]);

    return {
      current: currentResponse.data,
      currentMeta: currentResponse.meta,
      daily: dailyResponse.data,
      dailyMeta: dailyResponse.meta,
      hourly: hourlyResponse?.data ?? null,
      hourlyMeta: hourlyResponse?.meta ?? null,
    };
  } catch {
    return null;
  }
});

export async function getPlaceWeatherForSeo(city, locale = 'en') {
  if (!city?.lat || !city?.lon) {
    return null;
  }

  return getPlaceWeatherForSeoByKey(Number(city.lat), Number(city.lon), locale);
}

export function buildWeatherPlaceFaqItems(city, weather, t) {
  const temperature = weather?.current?.temperature;
  const condition = weather?.current?.description ?? weather?.current?.condition;
  const tempLabel = temperature != null ? `${Math.round(temperature)}°C` : null;
  const conditionLabel = condition ? String(condition).toLowerCase() : null;
  const nowSummary = [tempLabel, conditionLabel].filter(Boolean).join(', ');

  return [
    {
      question: t('weatherPlaceFaqWhatLikeQ', { city: city.name }),
      answer: nowSummary
        ? t('weatherPlaceFaqWhatLikeA', {
            city: city.name,
            summary: nowSummary,
            country: city.country,
          })
        : t('weatherPlaceFaqWhatLikeAFallback', {
            city: city.name,
            country: city.country,
          }),
    },
    {
      question: t('weatherPlaceFaqForecastQ', { city: city.name }),
      answer: t('weatherPlaceFaqForecastA', { city: city.name }),
    },
    {
      question: t('weatherPlaceFaqShortQ', { city: city.name }),
      answer: t('weatherPlaceFaqShortA', { city: city.name }),
    },
  ];
}
