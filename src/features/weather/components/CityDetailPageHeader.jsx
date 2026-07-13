'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CityDetailOptionsMenu } from '@/features/cities/components/CityDetailOptionsMenu';
import { countryCodeToFlagEmoji } from '@/features/cities/utils/city-search';
import { ICONS, TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function CityDetailPageHeader({
  city,
  isPinned,
  onRerunCheck,
  isRefreshing = false,
  onReportInaccurate,
  isReportActive = false,
  isReporting = false,
}) {
  const locationLabel = [city.state, city.country].filter(Boolean).join(', ');

  return (
    <section aria-labelledby="city-detail-title" className="flex flex-col gap-4">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className={ICONS.sm} aria-hidden />
        Back to dashboard
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 id="city-detail-title" className={cn(TYPOGRAPHY.heading, 'text-4xl tracking-tight')}>
            {city.name}
          </h1>
          {locationLabel ? (
            <p className={cn('flex items-center gap-2 text-muted-foreground', TYPOGRAPHY.body)}>
              <span className="text-base leading-none" aria-hidden>
                {countryCodeToFlagEmoji(city.country)}
              </span>
              <span>{locationLabel}</span>
            </p>
          ) : null}
        </div>

        <CityDetailOptionsMenu
          city={city}
          isPinned={isPinned}
          onRerunCheck={onRerunCheck}
          isRefreshing={isRefreshing}
          onReportInaccurate={onReportInaccurate}
          isReportActive={isReportActive}
          isReporting={isReporting}
        />
      </div>
    </section>
  );
}
