import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { JournalPostPage } from '@/features/weather/components/JournalPostPage';
import {
  getBlogPostById,
  getBlogPostIds,
  getBlogPosts,
} from '@/lib/cms/get-blog-content';
import { buildPageMetadata } from '@/lib/seo';
import { buildLanguageAlternates, buildLocalizedPath, getOgLocale } from '@/i18n/seo';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getBlogPostIds().map((slug) => ({
      locale,
      slug,
    })),
  );
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const post = getBlogPostById(slug, locale);
  if (!post) {
    return {};
  }

  return buildPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: buildLocalizedPath(post.href, locale),
    locale: getOgLocale(locale),
    languages: buildLanguageAlternates(post.href),
  });
}

export default async function JournalSlugPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getBlogPostById(slug, locale);
  if (!post) {
    notFound();
  }

  const relatedPosts = getBlogPosts(locale).filter((entry) => entry.id !== post.id).slice(0, 4);

  return (
    <JournalPostPage post={post} relatedPosts={relatedPosts} locale={locale} />
  );
}
