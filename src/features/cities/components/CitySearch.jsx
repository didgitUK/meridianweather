'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { resolveOpenWeatherLang } from '@/i18n/locales';
import { buildCityId } from '@/lib/utils';
import { prefetchWeatherBatch } from '@/features/weather/utils/weather-cache';
import { useCitySearch } from '@/features/cities/hooks/useCitySearch';
import { useSearchResultPreview } from '@/features/cities/hooks/useSearchResultPreview';
import { useUserLocationProfile } from '@/features/cities/hooks/useUserLocationProfile';
import { CitySearchDropdown } from '@/features/cities/components/CitySearchDropdown';
import { CitySearchLocationHint } from '@/features/cities/components/CitySearchLocationHint';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { TOUCH } from '@/constants/design-tokens';

const MAX_PREVIEW_PREFETCHES = 4;

export function CitySearch({
  onSelect,
  variant = 'card',
  actionLabel,
  inputId = 'city-search',
  autoFocus = false,
  hideLocationHint = false,
  className,
}) {
  const t = useTranslations('Search');
  const tCommon = useTranslations('Common');
  const tHeader = useTranslations('Header');
  const locale = useLocale();
  const weatherLang = resolveOpenWeatherLang(locale);
  const resolvedActionLabel = actionLabel ?? tHeader('checkAction');
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef(null);
  const [dropdownDismissed, setDropdownDismissed] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const {
    geocodeContext,
    displayLabel,
    sourceLabel,
    isLoading: isLocationLoading,
  } = useUserLocationProfile();
  const { query, setQuery, results, isLoading, error } = useCitySearch(geocodeContext);
  const { previews, loadPreview } = useSearchResultPreview();
  const isHero = variant === 'hero';
  const isInline = variant === 'inline';
  const isHeader = variant === 'header';
  const isCompact = isHero || isInline || isHeader;
  const showArchiveSubmit = isHeader || isHero;
  const showLocationHint = !isCompact && !hideLocationHint;
  const listboxId = `${inputId}-listbox`;
  const locationHintId = `${inputId}-location`;
  const showDropdown = query.trim().length >= 2 && !dropdownDismissed;
  const activeOptionId =
    showDropdown && highlightedIndex >= 0 && results[highlightedIndex]
      ? `${listboxId}-option-${highlightedIndex}`
      : undefined;

  useEffect(() => {
    function clearSearchField() {
      setQuery('');
      setDropdownDismissed(true);
    }

    clearSearchField();
    window.addEventListener('pageshow', clearSearchField);
    return () => window.removeEventListener('pageshow', clearSearchField);
  }, [pathname, setQuery]);

  useEffect(() => {
    setDropdownDismissed(false);
  }, [query]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query, results]);

  useEffect(() => {
    if (!showDropdown) {
      setHighlightedIndex(-1);
      return undefined;
    }

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setDropdownDismissed(true);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (!showDropdown || results.length === 0) {
      return;
    }

    results.slice(0, MAX_PREVIEW_PREFETCHES).forEach((result) => {
      void loadPreview(result);
    });
  }, [showDropdown, results, loadPreview]);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    document.getElementById(inputId)?.focus();
  }, [autoFocus, inputId]);

  function handleSelect(result) {
    const cityId = buildCityId(result.name, result.country, result.lat);
    prefetchWeatherBatch({
      lat: result.lat,
      lon: result.lon,
      cityId,
      scopes: ['current', 'hourly', 'daily'],
      trigger: WEATHER_CHECK_TRIGGERS.searchSelect,
      lang: weatherLang,
    });
    setQuery('');
    setDropdownDismissed(true);
    setHighlightedIndex(-1);
    onSelect(result);
  }

  function goToSearchArchive() {
    const next = query.trim();
    if (!next) {
      router.push('/search');
      return;
    }
    router.push(`/search?q=${encodeURIComponent(next)}`);
  }

  function handleArchiveSubmit(event) {
    event.preventDefault();
    if (showDropdown && highlightedIndex >= 0 && results[highlightedIndex]) {
      handleSelect(results[highlightedIndex]);
      return;
    }
    goToSearchArchive();
  }

  function handleInputKeyDown(event) {
    if (event.key === 'Escape') {
      if (showDropdown) {
        event.preventDefault();
        setDropdownDismissed(true);
        setHighlightedIndex(-1);
      }
      return;
    }

    if (!showDropdown || results.length === 0) {
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

    if (event.key === 'Enter' && !showArchiveSubmit) {
      if (highlightedIndex >= 0 && results[highlightedIndex]) {
        event.preventDefault();
        handleSelect(results[highlightedIndex]);
      }
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setHighlightedIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setHighlightedIndex(results.length - 1);
    }
  }

  const searchIcon = (
    <Search
      className={cn(
        'pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 sm:size-[1.125rem]',
        isHero || isHeader ? 'text-neutral-950' : 'text-muted-foreground',
      )}
      aria-hidden
    />
  );

  const inputClassName = cn(
    TOUCH.minH,
    'pl-10',
    showArchiveSubmit && 'pr-[4.75rem]',
    isInline && 'h-12 border-border/80 bg-background text-base',
    isHero
      && 'h-12 border-0 bg-white text-base text-neutral-950 shadow-none placeholder:text-neutral-950 focus-visible:border-0 focus-visible:ring-0 dark:bg-white dark:text-neutral-950 dark:placeholder:text-neutral-950',
    isHeader
      && 'h-11 border-white/20 bg-white text-sm text-neutral-950 placeholder:text-neutral-500 md:text-sm dark:bg-white dark:text-neutral-950',
  );

  const searchField = (
    <>
      {searchIcon}
      <Input
        id={inputId}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setDropdownDismissed(false)}
        onKeyDown={handleInputKeyDown}
        placeholder={t('placeholder')}
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        aria-autocomplete="list"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={inputClassName}
        aria-describedby={
          showLocationHint && (isLocationLoading || displayLabel) ? locationHintId : undefined
        }
      />
      {showArchiveSubmit ? (
        <Button
          type="submit"
          size="sm"
          className={cn(
            'absolute top-1/2 right-1.5 z-10 -translate-y-1/2 bg-black px-2.5 text-xs text-white hover:bg-neutral-800',
            isHero ? 'h-8' : 'h-7',
          )}
        >
          {tCommon('search')}
        </Button>
      ) : null}
      <CitySearchDropdown
        open={showDropdown}
        isLoading={isLoading}
        error={error}
        query={query}
        results={results}
        previews={previews}
        isHero={isCompact}
        actionLabel={resolvedActionLabel}
        geocodeContext={geocodeContext}
        listboxId={listboxId}
        highlightedIndex={highlightedIndex}
        onHighlight={setHighlightedIndex}
        onSelect={handleSelect}
      />
    </>
  );

  return (
    <div
      ref={rootRef}
      className={cn(isCompact ? 'w-full' : 'rounded-xl border bg-card p-4', className)}
    >
      {!isCompact ? (
        <label htmlFor={inputId} className="font-heading text-lg">
          {t('placeholder')}
        </label>
      ) : isHeader ? (
        <label htmlFor={inputId} className="sr-only">
          {t('label')}
        </label>
      ) : null}

      <div className={cn('relative', isHero ? 'z-50' : 'z-20', !isCompact && 'mt-3')}>
        {showArchiveSubmit ? (
          <form onSubmit={handleArchiveSubmit} className="relative overflow-visible" role="search">
            {searchField}
          </form>
        ) : (
          <div className="relative overflow-visible">{searchField}</div>
        )}
      </div>

      {showLocationHint && (isLocationLoading || displayLabel) ? (
        <div id={locationHintId} className="relative z-0">
          <CitySearchLocationHint
            displayLabel={displayLabel}
            sourceLabel={sourceLabel}
            isLoading={isLocationLoading}
          />
        </div>
      ) : null}
    </div>
  );
}
