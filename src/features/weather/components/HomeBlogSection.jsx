'use client';

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { BlogArticleCard } from '@/features/weather/components/BlogArticleCard';
import { RecentChecksCarouselControls } from '@/features/weather/components/RecentChecksCarouselControls';
import { getBlogPosts } from '@/constants/blog-posts';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

const GAP_PX = 16;

const TRACK_CLASS =
  'flex gap-4 overflow-x-auto pt-1 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

const BlogCarousel = forwardRef(function BlogCarousel({ posts, ariaLabel }, ref) {
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
          key={post.id}
          post={post}
          className="w-[min(18.5rem,78vw)] shrink-0 sm:w-[20rem]"
        />
      ))}
    </div>
  );
});

export function HomeBlogSection() {
  const t = useTranslations('Dashboard.blog');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const carouselRef = useRef(null);
  const posts = getBlogPosts(locale);
  const controlsEnabled = posts.length >= 2;

  return (
    <section className={cn('flex flex-col', SPACING.stack4)} aria-labelledby="home-blog-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="home-blog-heading" className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading)}>
            {t('title')}
          </h2>
          <p className={TYPOGRAPHY.muted}>
            {t('description')}
          </p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Link
            href="/journal"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            {tCommon('viewAll')} <span aria-hidden>&gt;</span>
          </Link>
          <RecentChecksCarouselControls
            disabled={!controlsEnabled}
            previousLabel={tCommon('showPreviousArticles')}
            nextLabel={tCommon('showNextArticles')}
            onPrevious={() => carouselRef.current?.scrollPrevious()}
            onNext={() => carouselRef.current?.scrollNext()}
          />
        </div>
      </div>

      <BlogCarousel ref={carouselRef} posts={posts} ariaLabel={t('carouselLabel')} />
    </section>
  );
}
