import { cache } from 'react';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { fetchPlaceScopesForSeo } from '@/lib/places/fetch-place-seo-scopes';
import {
  findUkPlaceBySlug,
  recordUkPlaceView,
} from '@/lib/places/uk-places-repo';
import { fetchWeatherForScope } from '@/lib/weather-fetch-orchestrator';

async function fetchPlaceScopesForDisplay(city, locale) {
  const options = {
    lang: locale,
    trigger: WEATHER_CHECK_TRIGGERS.cityDetail,
  };

  const [currentResponse, dailyResponse, hourlyResponse] = await Promise.all([
    fetchWeatherForScope(city.lat, city.lon, 'current', options),
    fetchWeatherForScope(city.lat, city.lon, 'daily', options),
    fetchWeatherForScope(city.lat, city.lon, 'hourly', options).catch(() => null),
  ]);

  return {
    current: currentResponse.data,
    currentMeta: currentResponse.meta,
    daily: dailyResponse.data,
    dailyMeta: dailyResponse.meta,
    hourly: hourlyResponse?.data ?? null,
    hourlyMeta: hourlyResponse?.meta ?? null,
  };
}

const getPlaceWeatherForSeoByKey = cache(async (lat, lon, locale, slug) => {
  const placeMeta = slug ? findUkPlaceBySlug(slug) : null;
  if (slug) {
    recordUkPlaceView(slug);
  }

  const city = {
    lat,
    lon,
    seoSlug: slug,
    population: placeMeta?.population,
  };

  try {
    return await fetchPlaceScopesForSeo(city, locale, placeMeta);
  } catch {
    // SEO TTL path failed (quota/cache) — still render with the normal city_detail path.
    try {
      return await fetchPlaceScopesForDisplay(city, locale);
    } catch {
      return null;
    }
  }
});

export async function getPlaceWeatherForSeo(city, locale = 'en') {
  if (!city?.lat || !city?.lon) {
    return null;
  }

  return getPlaceWeatherForSeoByKey(
    Number(city.lat),
    Number(city.lon),
    locale,
    city.seoSlug ?? null,
  );
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
