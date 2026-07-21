'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PLACE_POI_CATEGORY_ORDER } from '@/constants/place-content';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { haversineKm } from '@/lib/geo/distance';
import { cn } from '@/lib/utils';

/**
 * @param {{
 *   placeName: string,
 *   placeSlug: string,
 *   placeLat: number,
 *   placeLon: number,
 *   pois: Array<{
 *     id: string,
 *     name: string,
 *     category: string,
 *     lat: number,
 *     lon: number,
 *     osmId?: string | null,
 *   }>,
 * }} props
 */
export function PlaceThingsToDoSection({
  placeName,
  placeSlug,
  placeLat,
  placeLon,
  pois,
}) {
  const t = useTranslations('PlaceContent.thingsToDo');
  const [category, setCategory] = useState(PLACE_POI_CATEGORY_ORDER[0]);

  const enriched = useMemo(() => {
    return (pois ?? []).map((poi) => ({
      ...poi,
      distanceKm: haversineKm(placeLat, placeLon, poi.lat, poi.lon),
    }));
  }, [pois, placeLat, placeLon]);

  const counts = useMemo(() => {
    const map = Object.fromEntries(PLACE_POI_CATEGORY_ORDER.map((key) => [key, 0]));
    for (const poi of enriched) {
      if (map[poi.category] != null) {
        map[poi.category] += 1;
      }
    }
    return map;
  }, [enriched]);

  const activeCategory =
    counts[category] > 0
      ? category
      : PLACE_POI_CATEGORY_ORDER.find((key) => counts[key] > 0) ?? category;

  const visible = enriched
    .filter((poi) => poi.category === activeCategory)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  if (!enriched.length) {
    return null;
  }

  return (
    <section
      className={cn('flex flex-col', SPACING.stack4)}
      aria-labelledby="place-things-to-do-heading"
    >
      <div>
        <h2
          id="place-things-to-do-heading"
          className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading)}
        >
          {t('title', { place: placeName })}
        </h2>
        <p className={TYPOGRAPHY.muted}>{t('description')}</p>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label={t('categoriesLabel')}
      >
        {PLACE_POI_CATEGORY_ORDER.map((key) => {
          const count = counts[key] ?? 0;
          const selected = key === activeCategory;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={count === 0}
              onClick={() => setCategory(key)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:bg-muted',
                count === 0 && 'cursor-not-allowed opacity-40',
              )}
            >
              {t(`categories.${key}`)}
              <span className="ms-1.5 tabular-nums opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className={TYPOGRAPHY.muted} role="status">
          {t('emptyCategory')}
        </p>
      ) : (
        <ul className="divide-y divide-border/60 border-y border-border/60">
          {visible.map((poi) => {
            const detailHref = `/weather/${placeSlug}/things-to-do/${poi.id}`;
            const mapsUrl =
              `https://www.openstreetmap.org/?mlat=${poi.lat}&mlon=${poi.lon}#map=17/${poi.lat}/${poi.lon}`;
            const osmUrl = poi.osmId
              ? `https://www.openstreetmap.org/${poi.osmId}`
              : mapsUrl;

            return (
              <li
                key={poi.id}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <div>
                  <Link
                    href={detailHref}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {poi.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {t('distance', { km: formatDistance(poi.distanceKm) })}
                  </p>
                </div>
                <a
                  href={osmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
                >
                  {t('openOsm')}
                </a>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">{t('attribution')}</p>
    </section>
  );
}

function formatDistance(km) {
  if (!Number.isFinite(km)) {
    return '—';
  }
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}
