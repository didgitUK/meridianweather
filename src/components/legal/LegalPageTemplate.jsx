import { Link } from '@/i18n/navigation';
import { LegalSection } from '@/components/legal/LegalSection';
import { getLegalPolicies } from '@/lib/cms/get-cms-content';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildBreadcrumbSchema } from '@/lib/seo';

export function LegalSidebar({ policies, activeSlug, sections }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit">
      <nav aria-label="Policy navigation" className="rounded-xl border bg-card p-4">
        <p className="font-heading text-sm uppercase tracking-wide text-muted-foreground">Legal</p>
        <ul className="mt-3 flex flex-col gap-2">
          {policies.map((policy) => (
            <li key={policy.slug}>
              <Link
                href={`/legal/${policy.slug}`}
                aria-current={policy.slug === activeSlug ? 'page' : undefined}
                className="text-sm text-muted-foreground hover:text-foreground data-[active=true]:text-foreground"
                data-active={policy.slug === activeSlug}
              >
                {policy.title}
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

export function LegalPageTemplate({ policy }) {
  const policies = getLegalPolicies();
  const breadcrumbItems = [
    { name: 'Legal', path: '/legal/terms' },
    { name: policy.title, path: `/legal/${policy.slug}` },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <LegalSidebar policies={policies} activeSlug={policy.slug} sections={policy.sections} />
      <article>
        <Breadcrumbs items={breadcrumbItems} />
        <JsonLd data={buildBreadcrumbSchema(breadcrumbItems)} />
        <p className="text-sm text-muted-foreground">Last updated {policy.lastUpdated}</p>
        <h1 className="mt-2 font-heading text-4xl">{policy.title}</h1>
        <div className="mt-8 flex flex-col gap-8">
          {policy.sections.map((section) => (
            <LegalSection key={section.id} section={section} />
          ))}
        </div>
      </article>
    </div>
  );
}
