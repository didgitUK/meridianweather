'use client';

import { useEffect, useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { CitySearchResultRow } from '@/features/cities/components/CitySearchResultRow';
import { useCitySearch } from '@/features/cities/hooks/useCitySearch';
import { useSearchResultPreview } from '@/features/cities/hooks/useSearchResultPreview';
import { useUserLocationProfile } from '@/features/cities/hooks/useUserLocationProfile';
import { buildSearchResultKey } from '@/features/cities/utils/city-search';
import { TOUCH } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

const MAX_PREVIEW_PREFETCHES = 6;

export function CitySearchSheet({ open, onOpenChange, initialQuery = '', onSelect }) {
  const t = useTranslations('Search');
  const tHeader = useTranslations('Header');
  const inputId = useId();
  const listboxId = `${inputId}-sheet-listbox`;
  const { geocodeContext } = useUserLocationProfile();
  const { query, setQuery, results, isLoading, error } = useCitySearch(geocodeContext);
  const { previews, loadPreview } = useSearchResultPreview();
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuery(initialQuery);
    setHighlightedIndex(-1);
    const timer = window.setTimeout(() => {
      document.getElementById(inputId)?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [open, initialQuery, setQuery, inputId]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query, results]);

  useEffect(() => {
    if (!open || results.length === 0) {
      return;
    }

    results.slice(0, MAX_PREVIEW_PREFETCHES).forEach((result) => {
      void loadPreview(result);
    });
  }, [open, results, loadPreview]);

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      onOpenChange(false);
      return;
    }

    if (results.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((current) => (current + 1) % results.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
      return;
    }

    if (event.key === 'Enter' && highlightedIndex >= 0 && results[highlightedIndex]) {
      event.preventDefault();
      onSelect(results[highlightedIndex]);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex h-[min(92dvh,40rem)] max-h-[92dvh] w-full max-w-full flex-col gap-0 rounded-t-2xl p-0"
      >
        <SheetHeader className="shrink-0 border-b border-border/60 px-4 pt-4 pb-3 text-left">
          <SheetTitle className="font-heading text-left">{t('label')}</SheetTitle>
          <SheetDescription className="text-left">{t('sheetDescription')}</SheetDescription>
        </SheetHeader>

        <div className="shrink-0 px-4 py-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id={inputId}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder')}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={query.trim().length >= 2}
              aria-controls={listboxId}
              aria-autocomplete="list"
              className={cn(TOUCH.minH, 'h-12 pl-10 text-base')}
            />
          </div>
        </div>

        <div
          id={listboxId}
          role="listbox"
          aria-label={t('dropdownLabel')}
          className="meridian-scrollbar min-h-0 flex-1 overflow-y-auto px-2 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          {isLoading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">{t('searching')}</p>
          ) : null}
          {error ? (
            <p className="px-3 py-2 text-sm text-destructive">{error}</p>
          ) : null}

          <ul className="flex flex-col gap-1 pb-2" aria-live="polite">
            {results.map((result, index) => (
              <li key={buildSearchResultKey(result)} role="presentation">
                <CitySearchResultRow
                  id={`${listboxId}-option-${index}`}
                  result={result}
                  preview={previews[buildSearchResultKey(result)]}
                  userContext={geocodeContext}
                  inDropdown
                  selected={index === highlightedIndex}
                  onHighlight={() => setHighlightedIndex(index)}
                  onSelect={onSelect}
                  actionLabel={tHeader('checkAction')}
                />
              </li>
            ))}

            {!isLoading && !error && query.trim().length >= 2 && results.length === 0 ? (
              <li className="px-3 py-6 text-sm text-muted-foreground">{t('noCitiesFound')}</li>
            ) : null}

            {!isLoading && query.trim().length < 2 ? (
              <li className="px-3 py-6 text-sm text-muted-foreground">{t('archive.minChars')}</li>
            ) : null}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
