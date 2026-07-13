'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TOUCH } from '@/constants/design-tokens';
import {
  countryCodeToFlagEmoji,
  formatCityResultLabel,
  formatCitySubtitle,
} from '@/features/cities/utils/city-search';
import { SearchResultWeatherPreview } from '@/features/cities/components/SearchResultWeatherPreview';

export function CitySearchResultRow({
  result,
  preview,
  isHero,
  inDropdown = false,
  userContext,
  onSelect,
  actionLabel = 'Check',
}) {
  const subtitleOptions = { userContext };
  const subtitle = formatCitySubtitle(result, subtitleOptions);
  const accessibleLabel = formatCityResultLabel(result, subtitleOptions);
  const useDropdownStyle = inDropdown || isHero;

  return (
    <button
      type="button"
      role="option"
      aria-selected={false}
      onClick={() => onSelect(result)}
      aria-label={`${actionLabel} ${accessibleLabel}`}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2 px-2 py-2.5 text-left transition-colors sm:gap-3',
        TOUCH.minH,
        useDropdownStyle
          ? 'rounded-md hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
          : 'rounded-lg border border-border bg-card px-3 py-2.5',
      )}
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/50 text-lg leading-none"
        aria-hidden
      >
        {countryCodeToFlagEmoji(result.country)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{result.name}</p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2">
        <SearchResultWeatherPreview preview={preview} />
        <span
          aria-hidden
          className={cn(
            buttonVariants({ size: 'sm', variant: 'secondary' }),
            'pointer-events-none hidden min-h-9 sm:inline-flex',
          )}
        >
          {actionLabel}
        </span>
      </div>
    </button>
  );
}
