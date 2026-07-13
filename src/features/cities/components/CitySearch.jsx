'use client';

import { useEffect } from 'react';
import { Search } from 'lucide-react';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { buildCityId } from '@/lib/utils';
import { prefetchWeatherBatch } from '@/features/weather/utils/weather-cache';
import { useCitySearch } from '@/features/cities/hooks/useCitySearch';
import { useSearchResultPreview } from '@/features/cities/hooks/useSearchResultPreview';
import { useUserLocationProfile } from '@/features/cities/hooks/useUserLocationProfile';
import { CitySearchDropdown } from '@/features/cities/components/CitySearchDropdown';
import { CitySearchLocationHint } from '@/features/cities/components/CitySearchLocationHint';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { TOUCH } from '@/constants/design-tokens';

const SEARCH_PLACEHOLDER = 'Search A Location Worldwide';
const MAX_PREVIEW_PREFETCHES = 4;

export function CitySearch({
  onSelect,
  variant = 'card',
  actionLabel = 'Check',
  inputId = 'city-search',
  autoFocus = false,
  hideLocationHint = false,
}) {
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
  const showLocationHint = !isInline && !hideLocationHint;
  const listboxId = `${inputId}-listbox`;
  const locationHintId = `${inputId}-location`;
  const showDropdown = query.trim().length >= 2;

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
      scopes: ['current', 'hourly', 'daily', 'minutely'],
      trigger: WEATHER_CHECK_TRIGGERS.searchSelect,
    });
    onSelect(result);
  }

  return (
    <div className={cn(isHero || isInline ? 'w-full' : 'rounded-xl border bg-card p-4')}>
      {!isHero && !isInline ? (
        <label htmlFor={inputId} className="font-heading text-lg">
          Search A Location
        </label>
      ) : null}

      <div className={cn('relative z-20', !isHero && !isInline && 'mt-3')}>
        <Search className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground sm:size-[1.125rem]" />
        <Input
          id={inputId}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={SEARCH_PLACEHOLDER}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className={cn(
            TOUCH.minH,
            'pl-10',
            (isHero || isInline) && 'h-12 border-border/80 bg-background text-base',
          )}
          aria-describedby={
            showLocationHint && (isLocationLoading || displayLabel) ? locationHintId : undefined
          }
        />

        <CitySearchDropdown
          open={showDropdown}
          isLoading={isLoading}
          error={error}
          query={query}
          results={results}
          previews={previews}
          isHero={isHero || isInline}
          actionLabel={actionLabel}
          geocodeContext={geocodeContext}
          listboxId={listboxId}
          onSelect={handleSelect}
        />
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
