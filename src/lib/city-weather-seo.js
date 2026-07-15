import { cache } from 'react';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { fetchWeatherForScope } from '@/lib/weather-fetch-orchestrator';

const getCityWeatherForSeoByKey = cache(async (lat, lon, locale) => {
  try {
    const [currentResponse, dailyResponse, hourlyResponse] = await Promise.all([
      fetchWeatherForScope(lat, lon, 'current', {
        lang: locale,
        trigger: WEATHER_CHECK_TRIGGERS.cityDetail,
      }),
      fetchWeatherForScope(lat, lon, 'daily', {
        lang: locale,
        trigger: WEATHER_CHECK_TRIGGERS.cityDetail,
      }),
      fetchWeatherForScope(lat, lon, 'hourly', {
        lang: locale,
        trigger: WEATHER_CHECK_TRIGGERS.cityDetail,
      }).catch(() => null),
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

/** Dedupes generateMetadata + page fetches within one RSC request (keyed by coords + lang). */
export async function getCityWeatherForSeo(city, locale = 'en') {
  if (!city?.lat || !city?.lon) {
    return null;
  }

  return getCityWeatherForSeoByKey(Number(city.lat), Number(city.lon), locale);
}

export function summarizeCityWeather(weather, city) {
  if (!weather?.current) {
    return {
      title: `${city.name} weather forecast`,
      description: `Track current conditions and forecasts for ${city.name}, ${city.country} on meridian.`,
      temperature: null,
      condition: null,
      updatedAt: null,
    };
  }

  const temperature = weather.current.temperature;
  const condition = weather.current.description ?? weather.current.weather?.description;
  const updatedAt = weather.currentMeta?.fetchedAt ?? null;
  const tempLabel = temperature != null ? `${Math.round(temperature)}°C` : null;
  const descriptionParts = [
    tempLabel && condition ? `${tempLabel} and ${condition.toLowerCase()}` : tempLabel ?? condition,
    `in ${city.name}, ${city.country}`,
    '— 7-day forecast and live conditions on meridian.',
  ].filter(Boolean);

  return {
    title: `${city.name} weather forecast`,
    description: descriptionParts.join(' '),
    temperature,
    condition,
    updatedAt,
  };
}
