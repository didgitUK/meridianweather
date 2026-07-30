import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageSection } from '@/components/layout/PageSection';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

/**
 * Visible home editorial intro (AdSense / Search: not sr-only only).
 */
export async function HomeIntro() {
  const t = await getTranslations('Seo');
  const tHome = await getTranslations('HomeIntro');

  return (
    <PageSection className="border-b border-border/60 !py-6 sm:!py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 text-center sm:text-left">
        <h1 className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading)}>
          meridian — {t('homeTitle')}
        </h1>
        <p className={cn('mx-auto max-w-2xl sm:mx-0', TYPOGRAPHY.body)}>
          {t('homeIntro')}
        </p>
        <p className={cn('mx-auto max-w-2xl text-sm text-muted-foreground sm:mx-0', TYPOGRAPHY.muted)}>
          {tHome('support')}
          {' '}
          <Link href="/about" className="underline-offset-4 hover:underline">
            {tHome('about')}
          </Link>
          {', '}
          <Link href="/faq" className="underline-offset-4 hover:underline">
            {tHome('faq')}
          </Link>
          {', '}
          <Link href="/journal" className="underline-offset-4 hover:underline">
            {tHome('journal')}
          </Link>
          .
        </p>
      </div>
    </PageSection>
  );
}
