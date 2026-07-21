'use client';

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { BlogArticleCard } from '@/features/weather/components/BlogArticleCard';
import { RecentChecksCarouselControls } from '@/features/weather/components/RecentChecksCarouselControls';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

const GAP_PX = 16;

const TRACK_CLASS =
  'flex gap-4 overflow-x-auto pt-1 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

const GuidesCarousel = forwardRef(function GuidesCarousel({ posts, ariaLabel }, ref) {
  const scrollRef = useRef(null);

  const getStepWidth = useCallback(() => {
    const container = scrollRef.current;
    if (!container?.firstElementChild) {
      return 320;
    }
    return container.firstElementChild.getBoundingClientRect().width + GAP_PX;
  }, []);

  const scrollStep = useCallback(
    (direction) => {
      const container = scrollRef.current;
      if (!container) return;
      container.scrollBy({
        left: getStepWidth() * direction,
        behavior: 'smooth',
      });
    },
    [getStepWidth],
  );

  useImperativeHandle(
    ref,
    () => ({
      scrollPrevious: () => scrollStep(-1),
      scrollNext: () => scrollStep(1),
    }),
    [scrollStep],
  );

  return (
    <div
      ref={scrollRef}
      className={TRACK_CLASS}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      {posts.map((post) => (
        <BlogArticleCard
          key={post.id || post.slug}
          post={post}
          className="w-[min(18.5rem,78vw)] shrink-0 sm:w-[20rem]"
        />
      ))}
    </div>
  );
});

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
  const tCommon = useTranslations('Common');
  const carouselRef = useRef(null);

  if (!articles?.length) {
    return null;
  }

  const posts = articles.map((article) => ({
    id: article.id || article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    dateLabel: article.dateLabel,
    dateIso: article.dateIso,
    href: article.href,
    imageUrl: article.imageUrl || '/brand/og-default.png',
    imageAlt: article.imageCredit || article.title,
  }));

  const controlsEnabled = posts.length >= 2;

  return (
    <section
      className={cn('flex flex-col', SPACING.stack4)}
      aria-labelledby="place-guides-heading"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="place-guides-heading"
            className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading)}
          >
            {t('title', { place: placeName })}
          </h2>
          <p className={TYPOGRAPHY.muted}>{t('description')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('generatedDisclaimer')}</p>
        </div>
        <RecentChecksCarouselControls
          disabled={!controlsEnabled}
          previousLabel={tCommon('showPreviousArticles')}
          nextLabel={tCommon('showNextArticles')}
          onPrevious={() => carouselRef.current?.scrollPrevious()}
          onNext={() => carouselRef.current?.scrollNext()}
        />
      </div>

      <GuidesCarousel
        ref={carouselRef}
        posts={posts}
        ariaLabel={t('carouselLabel', { place: placeName })}
      />

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
