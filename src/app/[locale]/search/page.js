import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { LocationSearchArchive } from '@/features/cities/components/LocationSearchArchive';
import { PageSection } from '@/components/layout/PageSection';
import { buildPageMetadata } from '@/lib/seo';
import { buildLanguageAlternates, buildLocalizedPath, getOgLocale } from '@/i18n/seo';
import { routing } from '@/i18n/routing';

export async function generateMetadata({ params, searchParams }) {
  const { locale } = await params;
  const { q } = await searchParams;
  const query = typeof q === 'string' ? q.trim() : '';

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'Seo' });

  return buildPageMetadata({
    title: query ? t('searchTitleWithQuery', { query }) : t('searchTitle'),
    description: query
      ? t('searchDescriptionWithQuery', { query })
      : t('searchDescription'),
    path: buildLocalizedPath('/search', locale),
    locale: getOgLocale(locale),
    languages: buildLanguageAlternates('/search'),
  });
}

export default async function SearchPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Common' });

  return (
    <Suspense
      fallback={
        <PageSection>
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </PageSection>
      }
    >
      <LocationSearchArchive />
    </Suspense>
  );
}
