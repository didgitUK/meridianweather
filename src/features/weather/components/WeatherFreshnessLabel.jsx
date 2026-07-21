'use client';

import { useTranslations } from 'next-intl';
import { cn, formatAge } from '@/lib/utils';
import { useNow } from '@/hooks/use-now';

/**
 * Shared “Updated X ago” / offline / stale label for weather surfaces.
 */
export function WeatherFreshnessLabel({ meta, className }) {
  const t = useTranslations('Dashboard.weatherCard');
  const now = useNow();
  const fetchedAt = meta?.fetchedAt ?? null;

  if (!fetchedAt) {
    return null;
  }

  const age = formatAge(now - Date.parse(fetchedAt));
  const isOffline = Boolean(meta?.offline);
  const isStale = meta?.freshness === 'stale' || isOffline;

  let label = t('updated', { age });
  if (isOffline) {
    label = t('offlineUpdated', { age });
  } else if (isStale) {
    label = t('staleUpdated', { age });
  }

  return (
    <p
      className={cn(
        'mt-1.5 text-xs',
        isOffline || isStale
          ? 'text-amber-700 dark:text-amber-400'
          : 'text-muted-foreground',
        className,
      )}
      data-freshness={isOffline ? 'offline' : isStale ? 'stale' : 'fresh'}
    >
      {label}
    </p>
  );
}
