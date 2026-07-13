import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageSection } from '@/components/layout/PageSection';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const t = await getTranslations('Seo');

  return buildPageMetadata({
    title: t('notFoundTitle'),
    description: t('notFoundDescription'),
    path: '/404',
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default async function NotFoundPage() {
  const t = await getTranslations('Errors');

  return (
    <PageSection>
      <section className="mx-auto max-w-xl rounded-xl border bg-card p-8 text-center">
        <h1 className="font-heading text-3xl">{t('notFoundHeading')}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t('notFoundBody')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            {t('backHome')}
          </Link>
          <Link href="/docs" className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            {t('viewDocs')}
          </Link>
        </div>
      </section>
    </PageSection>
  );
}
