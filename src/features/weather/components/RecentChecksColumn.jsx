'use client';

import { useTranslations } from 'next-intl';
import {
  RecentCheckCard,
  RecentCheckCardSkeleton,
} from '@/features/weather/components/RecentCheckCard';
import { Button } from '@/components/ui/button';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

/**
 * @param {{
 *   title: string,
 *   description: string,
 *   empty: string,
 *   emptyActionLabel?: string | null,
 *   onEmptyAction?: (() => void) | null,
 *   checks: object[],
 *   isLoading?: boolean,
 *   skeletonCount?: number,
 * }} props
 */
export function RecentChecksColumn({
  title,
  description = null,
  empty,
  emptyActionLabel = null,
  onEmptyAction = null,
  checks,
  isLoading = false,
  skeletonCount = 5,
}) {
  const tCommon = useTranslations('Common');

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div>
        <h3 className={cn(TYPOGRAPHY.heading, 'text-lg sm:text-xl')}>{title}</h3>
        {description ? (
          <p className={cn('mt-1', TYPOGRAPHY.muted)}>{description}</p>
        ) : null}
      </div>

      {isLoading ? (
        <ul className="flex flex-col gap-2" aria-busy="true" aria-label={tCommon('loading')}>
          {Array.from({ length: skeletonCount }, (_, index) => (
            <li key={`skeleton-${index}`}>
              <RecentCheckCardSkeleton layout="stack" />
            </li>
          ))}
        </ul>
      ) : checks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-background/60 px-4 py-8 text-sm text-muted-foreground">
          <p>{empty}</p>
          {emptyActionLabel && onEmptyAction ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onEmptyAction}
            >
              {emptyActionLabel}
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {checks.map((check) => (
            <li key={check.cityId ?? `${check.lat}-${check.lon}-${check.cityName}`}>
              <RecentCheckCard check={check} layout="stack" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
