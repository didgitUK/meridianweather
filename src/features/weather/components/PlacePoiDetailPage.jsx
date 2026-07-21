import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { PageSection } from '@/components/layout/PageSection';
import { PlacePoiMap } from '@/features/weather/components/PlacePoiMap';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { haversineKm } from '@/lib/geo/distance';
import { cn } from '@/lib/utils';

/**
 * @param {{
 *   place: { name: string, slug: string, lat: number, lon: number },
 *   focusPoi: {
 *     id: string,
 *     name: string,
 *     category: string,
 *     lat: number,
 *     lon: number,
 *     osmId?: string | null,
 *   },
 *   categoryPois: Array<{
 *     id: string,
 *     name: string,
 *     category: string,
 *     lat: number,
 *     lon: number,
 *     osmId?: string | null,
 *   }>,
 * }} props
 */
export async function PlacePoiDetailPage({ place, focusPoi, categoryPois }) {
  const t = await getTranslations('PlaceContent.poiPage');
  const tThings = await getTranslations('PlaceContent.thingsToDo');
  const placePath = `/weather/${place.slug}`;
  const focusPath = `${placePath}/things-to-do/${focusPoi.id}`;

  const enriched = categoryPois
    .map((poi) => ({
      ...poi,
      distanceKm: haversineKm(place.lat, place.lon, poi.lat, poi.lon),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const mapsUrl =
    `https://www.openstreetmap.org/?mlat=${focusPoi.lat}&mlon=${focusPoi.lon}#map=17/${focusPoi.lat}/${focusPoi.lon}`;
  const osmUrl = focusPoi.osmId
    ? `https://www.openstreetmap.org/${focusPoi.osmId}`
    : mapsUrl;

  return (
    <>
      <PageSection>
        <Breadcrumbs
          items={[
            { name: place.name, path: placePath },
            { name: tThings('title', { place: place.name }), path: `${placePath}#place-things-to-do-heading` },
            { name: focusPoi.name, path: focusPath },
          ]}
        />

        <div className={cn('flex flex-col', SPACING.stack6)}>
          <header className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              <Link
                href={placePath}
                className="underline-offset-4 hover:underline"
              >
                {t('backToPlace', { place: place.name })}
              </Link>
            </p>
            <h1 className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading, 'text-balance')}>
              {t('title', { place: place.name, poi: focusPoi.name })}
            </h1>
            <p className={TYPOGRAPHY.muted}>
              {t('categoryLabel', {
                category: tThings(`categories.${focusPoi.category}`),
              })}
            </p>
          </header>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <PlacePoiMap focusPoi={focusPoi} categoryPois={enriched} />

            <aside className={cn('flex flex-col', SPACING.stack4)}>
              <div>
                <h2 className={cn(TYPOGRAPHY.heading, 'text-lg')}>
                  {t('nearbyInCategory', {
                    category: tThings(`categories.${focusPoi.category}`),
                  })}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{t('listHint')}</p>
              </div>

              <ul className="divide-y divide-border/60 border-y border-border/60">
                {enriched.map((poi) => {
                  const isFocus = poi.id === focusPoi.id;
                  const href = `${placePath}/things-to-do/${poi.id}`;
                  return (
                    <li key={poi.id} className="py-3">
                      {isFocus ? (
                        <p className="font-medium text-foreground" aria-current="page">
                          {poi.name}
                        </p>
                      ) : (
                        <Link
                          href={href}
                          className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          {poi.name}
                        </Link>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {tThings('distance', { km: formatDistance(poi.distanceKm) })}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <a
                href={osmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                {t('openOsm')}
              </a>

              <p className="text-xs text-muted-foreground">{tThings('attribution')}</p>
            </aside>
          </div>
        </div>
      </PageSection>
    </>
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
