'use client';

import { useTranslations } from 'next-intl';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

/**
 * Outbound local coverage headlines only — never hosts third-party bodies.
 * @param {{
 *   placeName: string,
 *   links: Array<{
 *     id: string,
 *     title: string,
 *     url: string,
 *     publisher?: string | null,
 *     publishedAt?: string | null,
 *   }>,
 * }} props
 */
export function PlaceLocalCoverageSection({ placeName, links }) {
  const t = useTranslations('PlaceContent.localCoverage');

  if (!links?.length) {
    return null;
  }

  return (
    <section
      className={cn('flex flex-col', SPACING.stack4)}
      aria-labelledby="place-local-coverage-heading"
    >
      <div>
        <h2
          id="place-local-coverage-heading"
          className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading)}
        >
          {t('title', { place: placeName })}
        </h2>
        <p className={TYPOGRAPHY.muted}>{t('description')}</p>
      </div>

      <ul className="divide-y divide-border/60 border-y border-border/60">
        {links.map((link) => (
          <li key={link.id} className="py-3">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {link.title}
            </a>
            <p className="mt-1 text-sm text-muted-foreground">
              {[link.publisher, formatDate(link.publishedAt)].filter(Boolean).join(' · ')}
            </p>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground">{t('disclaimer')}</p>
    </section>
  );
}

function formatDate(iso) {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
