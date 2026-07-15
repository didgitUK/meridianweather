import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { BlogArticleCard } from '@/features/weather/components/BlogArticleCard';
import { PageSection } from '@/components/layout/PageSection';
import { getBlogPosts } from '@/constants/blog-posts';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { buildPageMetadata } from '@/lib/seo';
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
    title: t('journalTitle'),
    description: t('journalDescription'),
    path: buildLocalizedPath('/journal', locale),
    locale: getOgLocale(locale),
    languages: buildLanguageAlternates('/journal'),
  });
}

export default async function JournalArchivePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Journal.archive');
  const tCommon = await getTranslations('Common');
  const posts = getBlogPosts(locale);

  return (
    <PageSection className="border-b-0">
      <div className={cn('flex flex-col', SPACING.stack6)}>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="underline-offset-4 hover:underline">
              {tCommon('backToDashboard')}
            </Link>
          </p>
          <h1 className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading)}>{t('title')}</h1>
          <p className={cn('max-w-2xl', TYPOGRAPHY.muted)}>{t('description')}</p>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <BlogArticleCard post={post} />
            </li>
          ))}
        </ul>
      </div>
    </PageSection>
  );
}
