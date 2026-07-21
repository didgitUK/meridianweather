import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PlacePoiDetailPage } from '@/features/weather/components/PlacePoiDetailPage';
import { getPlacePoi, listPlacePois } from '@/lib/places/place-pois-repo';
import { resolveWeatherPlaceOrCreate } from '@/lib/places/resolve-weather-place-or-create';
import { buildPageMetadata } from '@/lib/seo';
import { buildLanguageAlternates, buildLocalizedPath, getOgLocale } from '@/i18n/seo';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const { placeSlug, poiId, locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const decodedPlace = decodeURIComponent(placeSlug);
  const decodedPoiId = decodeURIComponent(poiId);
  const city = await resolveWeatherPlaceOrCreate(decodedPlace, null);
  if (!city) {
    return {};
  }

  const placeSlugResolved = city.seoSlug ?? decodedPlace;
  const poi = getPlacePoi(placeSlugResolved, decodedPoiId);
  if (!poi) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'PlaceContent.poiPage' });
  const path = `/weather/${placeSlugResolved}/things-to-do/${decodedPoiId}`;

  return buildPageMetadata({
    title: t('title', { place: city.name, poi: poi.name }),
    description: t('metaDescription', { place: city.name, poi: poi.name }),
    path: buildLocalizedPath(path, locale),
    locale: getOgLocale(locale),
    languages: buildLanguageAlternates(path),
  });
}

export default async function WeatherPlacePoiRoute({ params, searchParams }) {
  const { placeSlug, poiId, locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const decodedPlace = decodeURIComponent(placeSlug);
  const decodedPoiId = decodeURIComponent(poiId);
  const city = await resolveWeatherPlaceOrCreate(decodedPlace, query);
  if (!city) {
    notFound();
  }

  const placeSlugResolved = city.seoSlug ?? decodedPlace;
  const focusPoi = getPlacePoi(placeSlugResolved, decodedPoiId);
  if (!focusPoi) {
    notFound();
  }

  const categoryPois = listPlacePois(placeSlugResolved, {
    category: focusPoi.category,
  });

  return (
    <PlacePoiDetailPage
      place={{
        name: city.name,
        slug: placeSlugResolved,
        lat: city.lat,
        lon: city.lon,
      }}
      focusPoi={focusPoi}
      categoryPois={categoryPois}
    />
  );
}
