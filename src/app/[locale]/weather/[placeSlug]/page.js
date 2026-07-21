import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { CityDetailPage } from '@/features/weather/components/CityDetailPage';
import { BrandLoadingScreen } from '@/features/weather/components/CityDetailLoadingScreen';
import { PlaceGuidesSection } from '@/features/weather/components/PlaceGuidesSection';
import { PlaceLocalCoverageSection } from '@/features/weather/components/PlaceLocalCoverageSection';
import { PlaceThingsToDoSection } from '@/features/weather/components/PlaceThingsToDoSection';
import { PageSection } from '@/components/layout/PageSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { UK_PLACE_TIER_A } from '@/constants/uk-places-phase-a';
import {
  UK_PLACES_PHASE_A_LIMIT,
  UK_PLACES_PHASE_B_LIMIT,
} from '@/constants/weather-places';
import { summarizeCityWeather } from '@/lib/city-weather-seo';
import {
  listUkPlaces,
  seedAllUkPlaces,
  countUkPlaces,
} from '@/lib/places/uk-places-repo';
import { resolveWeatherPlaceOrCreate } from '@/lib/places/resolve-weather-place-or-create';
import {
  buildWeatherPlaceFaqItems,
  getPlaceWeatherForSeo,
} from '@/lib/places/weather-place-seo';
import { resolvePlaceDidYouKnow } from '@/lib/places/place-did-you-know';
import { enqueuePlaceContentIfNeeded } from '@/lib/places/enqueue-place-content';
import { listPublishedPlaceArticles } from '@/lib/places/place-articles-repo';
import { listPlaceLocalLinks } from '@/lib/places/place-local-links-repo';
import { listPlacePois } from '@/lib/places/place-pois-repo';
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

export async function generateMetadata({ params, searchParams }) {
  const { placeSlug, locale } = await params;
  const query = await searchParams;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  ensureUkPlacesSeeded();
  const city = await resolveWeatherPlaceOrCreate(placeSlug, query);
  if (!city) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'Seo' });
  const weather = await getPlaceWeatherForSeo(city, getOpenWeatherLang(locale));
  const summary = summarizeCityWeather(weather, city);
  const region = city.state || city.country;
  const canonicalSlug = city.seoSlug ?? city.id ?? placeSlug;
  const path = `/weather/${canonicalSlug}`;
  const title = t('weatherPlaceTitle', { city: city.name });
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
    title,
    description,
    path: buildLocalizedPath(path, locale),
    locale: getOgLocale(locale),
    languages: buildLanguageAlternates(path),
  });
}

export default async function WeatherPlacePage({ params, searchParams }) {
  const { placeSlug, locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  ensureUkPlacesSeeded();

  const decodedSlug = placeSlug;
  const city = await resolveWeatherPlaceOrCreate(decodedSlug, query);

  if (!city) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'Seo' });
  const weather = await getPlaceWeatherForSeo(city, getOpenWeatherLang(locale));
  // Map-first heroes (same as /city/) — skip photo fetch so stock Unsplash/Wikimedia
  // images are not resolved or shown for UK place pages.
  const heroImage = null;

  const placeSlugResolved = city.seoSlug ?? city.id;
  const path = `/weather/${placeSlugResolved}`;
  const region = city.state || city.country;
  const faqItems = buildWeatherPlaceFaqItems(city, weather, t);
  const pageTitle = t('weatherPlaceTitle', { city: city.name });
  const summary = summarizeCityWeather(weather, city);
  const pageDescription = summary.condition || summary.temperature != null
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
  const didYouKnow = resolvePlaceDidYouKnow(city);
  const factKeyByVariant = {
    lat: 'weatherPlaceFactLat',
    equator: 'weatherPlaceFactEquator',
    prime: 'weatherPlaceFactPrime',
    region: 'weatherPlaceFactRegion',
  };
  const seoFact = didYouKnow
    ? t(factKeyByVariant[didYouKnow.key], didYouKnow.params)
    : null;
  const initialScopes = weather
    ? {
        current: { data: weather.current, meta: weather.currentMeta },
        daily: { data: weather.daily, meta: weather.dailyMeta },
        ...(weather.hourly
          ? { hourly: { data: weather.hourly, meta: weather.hourlyMeta } }
          : {}),
      }
    : null;

  const pois = listPlacePois(placeSlugResolved);
  const guides = listPublishedPlaceArticles(placeSlugResolved);
  const localLinks = listPlaceLocalLinks(placeSlugResolved);

  enqueuePlaceContentIfNeeded(
    {
      slug: placeSlugResolved,
      name: city.name,
      lat: city.lat,
      lon: city.lon,
      adminArea: city.state,
      country: city.country,
      population: city.population,
      placeType: city.placeType,
      tier: city.tier,
      viewCount: city.viewCount,
      lastViewedAt: city.lastViewedAt,
    },
    weather,
  );

  const hasLocalContent = pois.length > 0 || guides.length > 0 || localLinks.length > 0;

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
          <Suspense fallback={<BrandLoadingScreen stageKey="loadingLocation" />}>
            <CityDetailPage
              cityId={city.id}
              initialCity={city}
              initialScopes={initialScopes}
              heroImage={heroImage}
              seoIntro={{
                title: t('weatherPlaceH1', { city: city.name }),
                factLabel: t('weatherPlaceDidYouKnow'),
                fact: seoFact,
                lede: t('weatherPlaceLede', { city: city.name, region }),
                bridge: t('weatherPlaceSeoBridge', { city: city.name }),
              }}
            />
          </Suspense>
        </div>
      </PageSection>

      {hasLocalContent ? (
        <PageSection
          className="border-b-0 bg-[#f7f7f7] dark:bg-background"
          innerClassName="!pb-[calc(var(--space-section-block)*2)]"
        >
          <div className="flex flex-col gap-12">
            <PlaceThingsToDoSection
              placeName={city.name}
              placeSlug={placeSlugResolved}
              placeLat={city.lat}
              placeLon={city.lon}
              pois={pois}
            />
            <PlaceGuidesSection
              placeName={city.name}
              placeSlug={placeSlugResolved}
              articles={guides}
            />
            <PlaceLocalCoverageSection
              placeName={city.name}
              links={localLinks}
            />
          </div>
        </PageSection>
      ) : null}
    </>
  );
}

