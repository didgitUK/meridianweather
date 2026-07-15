import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LegalSection } from '@/components/legal/LegalSection';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildBreadcrumbSchema } from '@/lib/seo';

export async function DocsSidebar({ pages, activeSlug, sections }) {
  const t = await getTranslations('Docs');

  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit">
      <nav aria-label={t('navLabel')} className="rounded-xl border bg-card p-4">
        <p className="font-heading text-sm uppercase tracking-wide text-muted-foreground">{t('navLabel')}</p>
        <ul className="mt-3 flex flex-col gap-2">
          {pages.map((page) => (
            <li key={page.slug}>
              <Link
                href={`/docs/${page.slug}`}
                aria-current={page.slug === activeSlug ? 'page' : undefined}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label={t('tocTitle')} className="mt-4 rounded-xl border bg-card p-4">
        <p className="font-heading text-sm uppercase tracking-wide text-muted-foreground">{t('tocTitle')}</p>
        <ul className="mt-3 flex flex-col gap-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-sm text-muted-foreground hover:text-foreground">
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

async function DocsRelatedLinks({ currentSlug, pages }) {
  const t = await getTranslations('Docs');
  const related = pages.filter((page) => page.slug !== currentSlug).slice(0, 3);

  return (
    <section className="mt-12 rounded-xl border bg-card p-5">
      <h2 className="font-heading text-xl">{t('relatedTitle')}</h2>
      <ul className="mt-4 flex flex-col gap-2">
        {related.map((page) => (
          <li key={page.slug}>
            <Link href={`/docs/${page.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function DocsPageTemplate({ page, pages, breadcrumbs = [] }) {
  const t = await getTranslations('Docs');
  const breadcrumbItems = breadcrumbs.length
    ? breadcrumbs
    : [
        { name: t('breadcrumb'), path: '/docs' },
        { name: page.title, path: `/docs/${page.slug}` },
      ];

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <DocsSidebar pages={pages} activeSlug={page.slug} sections={page.sections} />
      <article>
        <Breadcrumbs items={breadcrumbItems} />
        <JsonLd data={buildBreadcrumbSchema(breadcrumbItems)} />
        <p className="text-sm text-muted-foreground">{t('lastUpdated', { date: page.lastUpdated })}</p>
        <h1 className="mt-2 font-heading text-4xl">{page.title}</h1>
        <div className="mt-8 flex flex-col gap-8">
          {page.sections.map((section) => (
            <LegalSection key={section.id} section={section} />
          ))}
        </div>
        <DocsRelatedLinks currentSlug={page.slug} pages={pages} />
      </article>
    </div>
  );
}
