import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { DocsPageTemplate } from '@/components/docs/DocsPageTemplate';
import { DOCS_PAGE_DEFAULTS, getDocBySlug, getDocsPages } from '@/content/docs';
import { buildDocPageMetadata } from '@/lib/page-metadata';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    DOCS_PAGE_DEFAULTS.map((doc) => ({
      locale,
      slug: doc.slug,
    })),
  );
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const doc = getDocBySlug(slug, locale);

  if (!doc) {
    return {};
  }

  return buildDocPageMetadata(doc, locale);
}

export default async function DocsSlugPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const doc = getDocBySlug(slug, locale);
  if (!doc) {
    notFound();
  }

  return <DocsPageTemplate page={doc} pages={getDocsPages(locale)} />;
}
