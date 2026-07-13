import { Link } from '@/i18n/navigation';
import { LegalSection } from '@/components/legal/LegalSection';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildBreadcrumbSchema } from '@/lib/seo';

export function DocsSidebar({ pages, activeSlug, sections }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit">
      <nav aria-label="Documentation" className="rounded-xl border bg-card p-4">
        <p className="font-heading text-sm uppercase tracking-wide text-muted-foreground">Documentation</p>
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

      <nav aria-label="Table of contents" className="mt-4 rounded-xl border bg-card p-4">
        <p className="font-heading text-sm uppercase tracking-wide text-muted-foreground">On this page</p>
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

function DocsRelatedLinks({ currentSlug, pages }) {
  const related = pages.filter((page) => page.slug !== currentSlug).slice(0, 3);

  return (
    <section className="mt-12 rounded-xl border bg-card p-5">
      <h2 className="font-heading text-xl">Related documentation</h2>
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

export function DocsPageTemplate({ page, pages, breadcrumbs = [] }) {
  const breadcrumbItems = breadcrumbs.length
    ? breadcrumbs
    : [
        { name: 'Documentation', path: '/docs' },
        { name: page.title, path: `/docs/${page.slug}` },
      ];

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <DocsSidebar pages={pages} activeSlug={page.slug} sections={page.sections} />
      <article>
        <Breadcrumbs items={breadcrumbItems} />
        <JsonLd data={buildBreadcrumbSchema(breadcrumbItems)} />
        <p className="text-sm text-muted-foreground">Last updated {page.lastUpdated}</p>
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
