import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getDocsPages } from '@/content/docs';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildBreadcrumbSchema, buildPageMetadata } from '@/lib/seo';
import { buildLanguageAlternates, buildLocalizedPath, getOgLocale } from '@/i18n/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Seo' });

  return buildPageMetadata({
    title: t('docsTitle'),
    description: t('docsDescription'),
    path: buildLocalizedPath('/docs', locale),
    locale: getOgLocale(locale),
    languages: buildLanguageAlternates('/docs'),
  });
}

export default async function DocsHomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const docsPages = getDocsPages();
  const breadcrumbItems = [{ name: 'Documentation', path: '/docs' }];

  return (
    <article className="flex flex-col gap-8">
      <Breadcrumbs items={breadcrumbItems} />
      <JsonLd data={buildBreadcrumbSchema(breadcrumbItems)} />
      <div>
        <h1 className="font-heading text-4xl">meridian documentation</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Guides for using the dashboard, subscriptions, and API behaviour.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {docsPages.map((page) => (
          <li key={page.slug}>
            <Link
              href={`/docs/${page.slug}`}
              className="block rounded-xl border bg-card p-5 transition-colors hover:bg-muted/40"
            >
              <h2 className="font-heading text-xl">{page.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{page.sections[0]?.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
