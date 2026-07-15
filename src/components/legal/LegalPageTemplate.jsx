import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LegalSection } from '@/components/legal/LegalSection';
import { getLegalPolicies } from '@/lib/cms/get-cms-content';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildBreadcrumbSchema } from '@/lib/seo';

export async function LegalSidebar({ policies, activeSlug, sections }) {
  const t = await getTranslations('Legal');

  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit">
      <nav aria-label={t('navLabel')} className="rounded-xl border bg-card p-4">
        <p className="font-heading text-sm uppercase tracking-wide text-muted-foreground">{t('navTitle')}</p>
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

      <nav aria-label={t('tocLabel')} className="mt-4 rounded-xl border bg-card p-4">
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

export async function LegalPageTemplate({ policy, locale: localeProp }) {
  const t = await getTranslations('Legal');
  const locale = localeProp ?? (await getLocale());
  const policies = getLegalPolicies(locale);
  const breadcrumbItems = [
    { name: t('breadcrumb'), path: '/legal/terms' },
    { name: policy.title, path: `/legal/${policy.slug}` },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <LegalSidebar policies={policies} activeSlug={policy.slug} sections={policy.sections} />
      <article>
        <Breadcrumbs items={breadcrumbItems} />
        <JsonLd data={buildBreadcrumbSchema(breadcrumbItems)} />
        <p className="text-sm text-muted-foreground">{t('lastUpdated', { date: policy.lastUpdated })}</p>
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
