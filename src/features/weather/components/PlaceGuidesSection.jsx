'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

/**
 * @param {{
 *   placeName: string,
 *   placeSlug: string,
 *   articles: Array<{
 *     id?: string,
 *     slug: string,
 *     title: string,
 *     excerpt: string,
 *     category: string,
 *     dateLabel: string,
 *     dateIso?: string,
 *     href: string,
 *     imageUrl?: string | null,
 *     imageAlt?: string,
 *   }>,
 * }} props
 */
export function PlaceGuidesSection({ placeName, placeSlug, articles }) {
  const t = useTranslations('PlaceContent.guides');

  if (!articles?.length) {
    return null;
  }

  return (
    <section
      className={cn('flex flex-col', SPACING.stack4)}
      aria-labelledby="place-guides-heading"
    >
      <div>
        <h2
          id="place-guides-heading"
          className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading)}
        >
          {t('title', { place: placeName })}
        </h2>
        <p className={TYPOGRAPHY.muted}>{t('description')}</p>
      </div>

      <ul className="divide-y divide-border/60 border-y border-border/60">
        {articles.map((article) => (
          <li
            key={article.id || article.slug}
            className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between"
          >
            <div className="min-w-0">
              <Link
                href={article.href}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {article.title}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {article.excerpt}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {[article.category, article.dateLabel].filter(Boolean).join(' · ')}
              </p>
            </div>
            <Link
              href={article.href}
              className="shrink-0 text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              {t('readGuide')}
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground">{t('generatedDisclaimer')}</p>

      <p className="text-xs text-muted-foreground">
        {t('byline')}{' '}
        <Link
          href={`/weather/${placeSlug}`}
          className="underline-offset-4 hover:underline"
        >
          {placeName}
        </Link>
      </p>
    </section>
  );
}
