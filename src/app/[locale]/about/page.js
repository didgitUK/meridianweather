import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PageSection } from '@/components/layout/PageSection';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { LEGAL_ENTITY } from '@/constants/brand';
import { buildPageMetadata } from '@/lib/seo';
import { resolveRobots } from '@/lib/seo-indexability';
import { buildLanguageAlternates, buildLocalizedPath, getOgLocale } from '@/i18n/seo';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'Seo' });

  return buildPageMetadata({
    title: t('aboutTitle'),
    description: t('aboutDescription'),
    path: buildLocalizedPath('/about', locale),
    locale: getOgLocale(locale),
    languages: buildLanguageAlternates('/about'),
    robots: resolveRobots({ locale }),
  });
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('About');
  const tCommon = await getTranslations('Common');

  return (
    <PageSection className="border-b-0">
      <article className={cn('mx-auto flex max-w-3xl flex-col', SPACING.stack6)}>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="underline-offset-4 hover:underline">
              {tCommon('backToDashboard')}
            </Link>
          </p>
          <h1 className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading)}>{t('title')}</h1>
          <p className={cn('max-w-2xl', TYPOGRAPHY.muted)}>{t('lede')}</p>
        </div>

        <section className={cn('flex flex-col', SPACING.stack4)}>
          <h2 className={cn(TYPOGRAPHY.heading, 'text-lg')}>{t('whatTitle')}</h2>
          <p className={TYPOGRAPHY.body}>{t('whatBody1')}</p>
          <p className={TYPOGRAPHY.body}>{t('whatBody2')}</p>
        </section>

        <section className={cn('flex flex-col', SPACING.stack4)}>
          <h2 className={cn(TYPOGRAPHY.heading, 'text-lg')}>{t('dataTitle')}</h2>
          <p className={TYPOGRAPHY.body}>{t('dataBody1')}</p>
          <p className={TYPOGRAPHY.body}>{t('dataBody2')}</p>
        </section>

        <section className={cn('flex flex-col', SPACING.stack4)}>
          <h2 className={cn(TYPOGRAPHY.heading, 'text-lg')}>{t('whoTitle')}</h2>
          <p className={TYPOGRAPHY.body}>
            {t('whoBody', {
              company: LEGAL_ENTITY.companyName,
              trading: LEGAL_ENTITY.tradingName,
            })}
          </p>
          <p className={TYPOGRAPHY.body}>{t('whoBody2')}</p>
        </section>

        <section className={cn('flex flex-col', SPACING.stack4)}>
          <h2 className={cn(TYPOGRAPHY.heading, 'text-lg')}>{t('adsTitle')}</h2>
          <p className={TYPOGRAPHY.body}>{t('adsBody')}</p>
        </section>

        <p className={TYPOGRAPHY.muted}>
          <Link href="/faq" className="underline-offset-4 hover:underline">
            {t('faqLink')}
          </Link>
          {' · '}
          <Link href="/journal" className="underline-offset-4 hover:underline">
            {t('journalLink')}
          </Link>
          {' · '}
          <Link href="/legal/privacy" className="underline-offset-4 hover:underline">
            {t('privacyLink')}
          </Link>
        </p>
      </article>
    </PageSection>
  );
}
