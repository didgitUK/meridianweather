import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { CityDetailPage } from '@/features/weather/components/CityDetailPage';
import { PageSection } from '@/components/layout/PageSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { getCityWeatherForSeo, summarizeCityWeather } from '@/lib/city-weather-seo';
import { resolveCity, getShowcaseCities } from '@/lib/resolve-city';
import { buildCityWebPageSchema, buildPageMetadata, buildPlaceSchema } from '@/lib/seo';
import { buildLanguageAlternates, buildLocalizedPath, getOgLocale, getOpenWeatherLang } from '@/i18n/seo';
import { routing } from '@/i18n/routing';

export const revalidate = 900;
export const dynamicParams = true;

export function generateStaticParams() {
  return getShowcaseCities().flatMap((city) =>
    routing.locales.map((locale) => ({
      locale,
      cityId: city.id,
    })),
  );
}

export async function generateMetadata({ params }) {
  const { cityId, locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const city = resolveCity(cityId);
  if (!city) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'Seo' });
  const weather = await getCityWeatherForSeo(city, getOpenWeatherLang(locale));
  const summary = summarizeCityWeather(weather, city);
  const path = `/city/${city.id}`;

  return buildPageMetadata({
    title: t('cityForecastTitle', { city: city.name }),
    description: summary.description || t('cityForecastFallback', { city: city.name, country: city.country }),
    path: buildLocalizedPath(path, locale),
    locale: getOgLocale(locale),
    languages: buildLanguageAlternates(path),
  });
}

export default async function CityPage({ params }) {
  const { cityId, locale } = await params;
  setRequestLocale(locale);

  const decodedCityId = decodeURIComponent(cityId);
  const city = resolveCity(decodedCityId);

  if (!city) {
    notFound();
  }

  const weather = await getCityWeatherForSeo(city, getOpenWeatherLang(locale));
  const path = `/city/${city.id}`;
  const initialScopes = weather
    ? {
        current: { data: weather.current, meta: weather.currentMeta },
        daily: { data: weather.daily, meta: weather.dailyMeta },
      }
    : null;

  return (
    <PageSection>
      <div className="flex flex-col gap-8">
        <JsonLd data={buildPlaceSchema(city)} />
        <JsonLd data={buildCityWebPageSchema(city, buildLocalizedPath(path, locale))} />
        <CityDetailPage cityId={decodedCityId} initialCity={city} initialScopes={initialScopes} />
      </div>
    </PageSection>
  );
}
