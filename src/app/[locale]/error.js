'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PageSection } from '@/components/layout/PageSection';

export default function ErrorPage({ reset }) {
  const t = useTranslations('Errors');

  return (
    <PageSection>
      <section className="mx-auto max-w-xl rounded-xl border bg-card p-8 text-center">
        <h1 className="font-heading text-3xl">{t('errorHeading')}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t('errorBody')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            Try again
          </button>
          <Link href="/" className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            {t('backHome')}
          </Link>
        </div>
      </section>
    </PageSection>
  );
}
