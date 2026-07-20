import { cache } from 'react';
import { fetchPlaceScopesForSeo } from '@/lib/places/fetch-place-seo-scopes';
import {
  findUkPlaceBySlug,
  recordUkPlaceView,
} from '@/lib/places/uk-places-repo';

const getPlaceWeatherForSeoByKey = cache(async (lat, lon, locale, slug) => {
  try {
    const placeMeta = slug ? findUkPlaceBySlug(slug) : null;
    if (slug) {
      recordUkPlaceView(slug);
    }

    return await fetchPlaceScopesForSeo(
      {
        lat,
        lon,
        seoSlug: slug,
        population: placeMeta?.population,
      },
      locale,
      placeMeta,
    );
  } catch {
    return null;
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
