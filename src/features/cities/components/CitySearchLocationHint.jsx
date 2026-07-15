'use client';

import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function CitySearchLocationHint({
  displayLabel,
  sourceLabel,
  isLoading,
}) {
  const t = useTranslations('Common');

  if (isLoading) {
    return <Skeleton className="mt-2 h-9 w-full rounded-lg" />;
  }

  if (!displayLabel) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/15 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-2 text-sm">
        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0">
          <p className="font-medium">{t('near', { label: displayLabel })}</p>
          {sourceLabel ? (
            <p className="text-xs text-muted-foreground">{t('basedOn', { source: sourceLabel })}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
