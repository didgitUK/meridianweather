import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { CityDetailPage } from '@/features/weather/components/CityDetailPage';
import { HomeBlogSection } from '@/features/weather/components/HomeBlogSection';
import { PageSection } from '@/components/layout/PageSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { UK_PLACE_TIER_A } from '@/constants/uk-places-phase-a';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import {
  UK_PLACES_PHASE_A_LIMIT,
  UK_PLACES_PHASE_B_LIMIT,
} from '@/constants/weather-places';
import { summarizeCityWeather } from '@/lib/city-weather-seo';
import { getHeroImageForRegion } from '@/lib/hero-image/get-hero-image-for-region';
import {
  listUkPlaces,
  resolveWeatherPlace,
  seedAllUkPlaces,
  countUkPlaces,
} from '@/lib/places/uk-places-repo';
import {
  buildWeatherPlaceFaqItems,
  getPlaceWeatherForSeo,
} from '@/lib/places/weather-place-seo';
import {
  buildCityWebPageSchema,
  buildFaqSchema,
  buildPageMetadata,
  buildPlaceSchema,
} from '@/lib/seo';
import { buildLanguageAlternates, buildLocalizedPath, getOgLocale, getOpenWeatherLang } from '@/i18n/seo';
import { routing } from '@/i18n/routing';

// Literal required — Next segment config cannot use imported bindings.
// Force dynamic: upstream weather fetches are uncached and conflict with ISR on Gandi.
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const UK_PLACES_SEED_FLOOR = UK_PLACES_PHASE_A_LIMIT + Math.floor(UK_PLACES_PHASE_B_LIMIT * 0.5);

function ensureUkPlacesSeeded() {
  // Upsert is safe; re-run when Phase B is missing on hosts that only seeded Phase A once.
  if (countUkPlaces() < UK_PLACES_SEED_FLOOR) {
    seedAllUkPlaces();
  }
}

export function generateStaticParams() {
  if (process.env.GANDI) {
    return [];
  }

  ensureUkPlacesSeeded();
  const places = listUkPlaces({ tier: UK_PLACE_TIER_A, limit: 100 });

  return places.flatMap((place) =>
    routing.locales.map((locale) => ({
      locale,
      placeSlug: place.slug,
    })),
  );
}

export async function generateMetadata({ params }) {
  const { placeSlug, locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  ensureUkPlacesSeeded();
  const city = resolveWeatherPlace(placeSlug);
  if (!city) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'Seo' });
  const weather = await getPlaceWeatherForSeo(city, getOpenWeatherLang(locale));
  const summary = summarizeCityWeather(weather, city);
  const region = city.state || city.country;
  const path = `/weather/${city.seoSlug ?? placeSlug}`;
  const description = summary.condition || summary.temperature != null
    ? t('weatherPlaceDescriptionWithSummary', {
        city: city.name,
        region,
        summary: [
          summary.temperature != null ? `${Math.round(summary.temperature)}°C` : null,
          summary.condition,
        ]
          .filter(Boolean)
          .join(', '),
      })
    : t('weatherPlaceDescription', { city: city.name, region });

  return buildPageMetadata({
    title: t('weatherPlaceTitle', { city: city.name }),
    description,
    path: buildLocalizedPath(path, locale),
    locale: getOgLocale(locale),
    languages: buildLanguageAlternates(path),
  });
}

export default async function WeatherPlacePage({ params }) {
  const { placeSlug, locale } = await params;
  setRequestLocale(locale);
  ensureUkPlacesSeeded();

  const decodedSlug = decodeURIComponent(placeSlug);
  const city = resolveWeatherPlace(decodedSlug);

  if (!city) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'Seo' });
  const weather = await getPlaceWeatherForSeo(city, getOpenWeatherLang(locale));
  const heroImage = await getHeroImageForRegion({
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

  const path = `/weather/${city.seoSlug ?? decodedSlug}`;
  const region = city.state || city.country;
  const faqItems = buildWeatherPlaceFaqItems(city, weather, t);
  const pageTitle = t('weatherPlaceTitle', { city: city.name });
  const pageDescription = t('weatherPlaceDescription', { city: city.name, region });
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
          <JsonLd
            data={buildCityWebPageSchema(city, buildLocalizedPath(path, locale), {
              title: pageTitle,
              description: pageDescription,
            })}
          />
          <JsonLd data={buildFaqSchema(faqItems)} />
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading forecast…</p>}>
            <CityDetailPage
              cityId={city.id}
              initialCity={city}
              initialScopes={initialScopes}
              heroImage={heroImage}
              preferPhotoHero
              weatherCheckTrigger={WEATHER_CHECK_TRIGGERS.weatherPlaceSeo}
              showMidAd
              seoIntro={{
                title: t('weatherPlaceH1', { city: city.name }),
                lede: t('weatherPlaceLede', { city: city.name, region }),
              }}
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

