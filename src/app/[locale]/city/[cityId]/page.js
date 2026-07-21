import { Suspense } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { CityDetailPage } from '@/features/weather/components/CityDetailPage';
import { HomeBlogSection } from '@/features/weather/components/HomeBlogSection';
import { PageSection } from '@/components/layout/PageSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { getCityWeatherForSeo, summarizeCityWeather } from '@/lib/city-weather-seo';
import { getHeroImageForRegion } from '@/lib/hero-image/get-hero-image-for-region';
import { findUkPlaceByCitySlug, findUkPlaceNearCoords } from '@/lib/places/uk-places-repo';
import { resolveCity, getShowcaseCities } from '@/lib/resolve-city';
import { buildCityWebPageSchema, buildPageMetadata, buildPlaceSchema } from '@/lib/seo';
import { buildLanguageAlternates, buildLocalizedPath, getOgLocale, getOpenWeatherLang } from '@/i18n/seo';
import { routing } from '@/i18n/routing';
import { isCityHeroOsmEnabled } from '@/lib/city-hero-flags';

export const revalidate = 900;
export const dynamicParams = true;

export function generateStaticParams() {
  // Skip showcase pre-render on constrained hosts (Gandi builder process limits).
  if (process.env.GANDI) {
    return [];
  }

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

  const ukPlace =
    findUkPlaceByCitySlug(city.id)
    ?? (city.country === 'GB' ? findUkPlaceNearCoords(city.lat, city.lon, 'GB') : null);

  if (ukPlace?.slug) {
    permanentRedirect(buildLocalizedPath(`/weather/${ukPlace.slug}`, locale));
  }

  const weather = await getCityWeatherForSeo(city, getOpenWeatherLang(locale));
  // Map-first heroes — skip stock photo cascade when satellite backdrop is on.
  const heroImage = isCityHeroOsmEnabled()
    ? null
    : await getHeroImageForRegion({
        city: city.name,
        state: city.state,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
        temperature: weather?.current?.temperature ?? null,
        weatherId: weather?.current?.weatherId ?? null,
        condition: weather?.current?.condition ?? null,
        description: weather?.current?.description ?? null,
        icon: weather?.current?.icon ?? null,
      }).catch(() => null);
  const path = `/city/${city.id}`;
  const initialScopes = weather
    ? {
        current: { data: weather.current, meta: weather.currentMeta },
        daily: { data: weather.daily, meta: weather.dailyMeta },
        ...(weather.hourly
          ? { hourly: { data: weather.hourly, meta: weather.hourlyMeta } }
          : {}),
      }
    : null;

  return (
    <>
      <PageSection innerClassName="!pt-0">
        <div className="flex flex-col gap-8">
          <JsonLd data={buildPlaceSchema(city)} />
          <JsonLd data={buildCityWebPageSchema(city, buildLocalizedPath(path, locale))} />
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading forecast…</p>}>
            <CityDetailPage
              cityId={decodedCityId}
              initialCity={city}
              initialScopes={initialScopes}
              heroImage={heroImage}
            />
          </Suspense>
        </div>
      </PageSection>

      <PageSection
        className="border-b-0 bg-[#f7f7f7] dark:bg-background"
        innerClassName="!pb-[calc(var(--space-section-block)*2)]"
      >
        <HomeBlogSection />
      </PageSection>
    </>
  );
}
