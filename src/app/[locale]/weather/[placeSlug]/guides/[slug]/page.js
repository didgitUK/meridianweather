import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { PlaceGuidePage } from '@/features/weather/components/PlaceGuidePage';
import { PLACE_ARTICLE_STATUS } from '@/constants/place-content';
import {
  getPlaceArticle,
  listPublishedPlaceArticles,
} from '@/lib/places/place-articles-repo';
import { resolveWeatherPlaceOrCreate } from '@/lib/places/resolve-weather-place-or-create';
import { buildPageMetadata } from '@/lib/seo';
import { buildLanguageAlternates, buildLocalizedPath, getOgLocale } from '@/i18n/seo';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const { placeSlug, slug, locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const decodedPlace = decodeURIComponent(placeSlug);
  const decodedSlug = decodeURIComponent(slug);
  const article = getPlaceArticle(decodedPlace, decodedSlug);
  if (!article || article.status !== PLACE_ARTICLE_STATUS.published) {
    return {};
  }

  const path = `/weather/${decodedPlace}/guides/${decodedSlug}`;
  return buildPageMetadata({
    title: article.title,
    description: article.excerpt,
    path: buildLocalizedPath(path, locale),
    locale: getOgLocale(locale),
    languages: buildLanguageAlternates(path),
  });
}

export default async function WeatherPlaceGuideRoute({ params, searchParams }) {
  const { placeSlug, slug, locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const decodedPlace = decodeURIComponent(placeSlug);
  const decodedSlug = decodeURIComponent(slug);
  const city = await resolveWeatherPlaceOrCreate(decodedPlace, query);
  if (!city) {
    notFound();
  }

  const placeSlugResolved = city.seoSlug ?? decodedPlace;
  const article = getPlaceArticle(placeSlugResolved, decodedSlug);
  if (!article || article.status !== PLACE_ARTICLE_STATUS.published) {
    notFound();
  }

  const relatedArticles = listPublishedPlaceArticles(placeSlugResolved).filter(
    (row) => row.slug !== decodedSlug,
  );

  const path = article.href;
  return (
    <PlaceGuidePage
      article={article}
      place={{ name: city.name, slug: placeSlugResolved }}
      localePath={buildLocalizedPath(path, locale)}
      relatedArticles={relatedArticles}
    />
  );
}
