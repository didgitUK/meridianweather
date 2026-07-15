'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CitySearchResultRow } from '@/features/cities/components/CitySearchResultRow';
import { buildSearchResultKey } from '@/features/cities/utils/city-search';
import { cn } from '@/lib/utils';

export function CitySearchDropdown({
  open,
  isLoading,
  error,
  query,
  results,
  previews,
  isHero,
  actionLabel,
  geocodeContext,
  listboxId = 'city-search-listbox',
  highlightedIndex = -1,
  onHighlight,
  onSelect,
}) {
  const t = useTranslations('Search');

  useEffect(() => {
    if (!open || highlightedIndex < 0) {
      return;
    }

    document
      .getElementById(`${listboxId}-option-${highlightedIndex}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, highlightedIndex, listboxId]);

  if (!open) {
    return null;
  }

  return (
    <div
      id={listboxId}
      role="listbox"
      aria-label={t('dropdownLabel')}
      className={cn(
        'absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg ring-1 ring-border/40',
        isHero && 'bg-background',
      )}
    >
      {isLoading ? (
        <p className="border-b border-border/60 px-3 py-2 text-sm text-muted-foreground">{t('searching')}</p>
      ) : null}

      {error ? (
        <p className="border-b border-border/60 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}

      <ul className="meridian-scrollbar max-h-[min(18rem,50dvh)] overflow-y-auto p-1 sm:max-h-72" aria-live="polite">
        {results.map((result, index) => (
          <li key={buildSearchResultKey(result)} role="presentation">
            <CitySearchResultRow
              id={`${listboxId}-option-${index}`}
              result={result}
              preview={previews[buildSearchResultKey(result)]}
              userContext={geocodeContext}
              inDropdown
              selected={index === highlightedIndex}
              onHighlight={onHighlight ? () => onHighlight(index) : undefined}
              onSelect={onSelect}
              actionLabel={actionLabel}
            />
          </li>
        ))}

        {!isLoading && !error && query.length >= 2 && results.length === 0 ? (
          <li className="px-3 py-4 text-sm text-muted-foreground">{t('noCitiesFound')}</li>
        ) : null}
      </ul>
    </div>
  );
}
