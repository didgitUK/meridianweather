import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PageSection } from '@/components/layout/PageSection';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { buildPageMetadata } from '@/lib/seo';
import { resolveRobots } from '@/lib/seo-indexability';
import { buildLanguageAlternates, buildLocalizedPath, getOgLocale } from '@/i18n/seo';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const FAQ_IDS = [
  'whatIs',
  'accuracy',
  'dataSource',
  'ukCoverage',
  'ads',
  'consent',
  'alerts',
  'account',
  'places',
  'adFree',
  'languages',
  'contact',
];

export async function generateMetadata({ params }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'Seo' });

  return buildPageMetadata({
    title: t('faqTitle'),
    description: t('faqDescription'),
    path: buildLocalizedPath('/faq', locale),
    locale: getOgLocale(locale),
    languages: buildLanguageAlternates('/faq'),
    robots: resolveRobots({ locale }),
  });
}

export default async function FaqPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Faq');
  const tCommon = await getTranslations('Common');

  return (
    <PageSection className="border-b-0">
      <div className={cn('mx-auto flex max-w-3xl flex-col', SPACING.stack6)}>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="underline-offset-4 hover:underline">
              {tCommon('backToDashboard')}
            </Link>
          </p>
          <h1 className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading)}>{t('title')}</h1>
          <p className={cn('max-w-2xl', TYPOGRAPHY.muted)}>{t('description')}</p>
        </div>

        <dl className={cn('flex flex-col', SPACING.stack6)}>
          {FAQ_IDS.map((id) => (
            <div key={id} className="flex flex-col gap-2">
              <dt className={cn(TYPOGRAPHY.heading, 'text-lg')}>
                {t(`items.${id}.q`)}
              </dt>
              <dd className={TYPOGRAPHY.body}>{t(`items.${id}.a`)}</dd>
            </div>
          ))}
        </dl>

        <p className={TYPOGRAPHY.muted}>
          <Link href="/about" className="underline-offset-4 hover:underline">
            {t('aboutLink')}
          </Link>
          {' · '}
          <Link href="/journal" className="underline-offset-4 hover:underline">
            {t('journalLink')}
          </Link>
        </p>
      </div>
    </PageSection>
  );
}
