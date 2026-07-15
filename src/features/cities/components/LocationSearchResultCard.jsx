'use client';

import { MapPin } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { TOUCH } from '@/constants/design-tokens';
import { SearchResultWeatherPreview } from '@/features/cities/components/SearchResultWeatherPreview';
import {
  buildStreetMapPreviewUrl,
  countryCodeToFlagEmoji,
  formatCityRegionParts,
  formatCityResultLabel,
  formatCoordinates,
  formatDistanceKm,
} from '@/features/cities/utils/city-search';
import { haversineKm } from '@/lib/geo/distance';
import { cn } from '@/lib/utils';

/**
 * Archive-style search result: map preview + region hierarchy for disambiguation.
 */
export function LocationSearchResultCard({
  result,
  preview,
  userContext,
  onSelect,
  actionLabel = 'Open',
  mapAlt,
}) {
  const regionParts = formatCityRegionParts(result);
  const regionLine = regionParts.join(' · ');
  const coordinates = formatCoordinates(result.lat, result.lon);
  const accessibleLabel = formatCityResultLabel(result, { userContext });
  const mapUrl = buildStreetMapPreviewUrl(result.lat, result.lon);
  const distanceLabel =
    userContext?.lat != null && userContext?.lon != null
      ? formatDistanceKm(
          haversineKm(userContext.lat, userContext.lon, result.lat, result.lon),
        )
      : null;
  const weatherDescription = preview?.data?.description ?? null;

  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      aria-label={`${actionLabel} ${accessibleLabel}`}
      className={cn(
        'group flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border/80 bg-card text-left shadow-sm transition-colors',
        'hover:border-border hover:bg-muted/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        'sm:flex-row',
        TOUCH.minH,
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted sm:aspect-auto sm:w-44 md:w-52 lg:w-56">
        {mapUrl ? (
          // Remote ArcGIS export — plain img avoids next/image remotePatterns churn.
          <img
            src={mapUrl}
            alt={mapAlt ?? ''}
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" aria-hidden />
        )}
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/10"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-[60%] flex-col items-center"
          aria-hidden
        >
          <MapPin className="size-7 fill-primary text-white drop-shadow-md" strokeWidth={1.75} />
        </span>
        <span
          className="absolute top-2 left-2 flex size-8 items-center justify-center rounded-md bg-background/90 text-lg leading-none shadow-sm ring-1 ring-border/60"
          aria-hidden
        >
          {countryCodeToFlagEmoji(result.country)}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:py-4 sm:pr-4 sm:pl-5">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h2 className="font-heading text-lg leading-snug text-foreground sm:text-xl">
            {result.name}
          </h2>
          {regionLine ? (
            <p className="text-sm leading-snug text-muted-foreground">{regionLine}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {coordinates ? (
              <span className="font-tabular tracking-wide">{coordinates}</span>
            ) : null}
            {coordinates && distanceLabel ? <span aria-hidden>·</span> : null}
            {distanceLabel ? <span>{distanceLabel}</span> : null}
            {(coordinates || distanceLabel) && weatherDescription ? (
              <span aria-hidden>·</span>
            ) : null}
            {weatherDescription ? <span className="capitalize">{weatherDescription}</span> : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
          <SearchResultWeatherPreview preview={preview} />
          <span
            aria-hidden
            className={cn(
              buttonVariants({ size: 'sm', variant: 'secondary' }),
              'pointer-events-none min-h-9 shrink-0',
            )}
          >
            {actionLabel}
          </span>
        </div>
      </div>
    </button>
  );
}
