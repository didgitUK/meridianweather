import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useUserLocationProfile } from '@/features/cities/hooks/useUserLocationProfile';
import { RecentChecksColumn } from '@/features/weather/components/RecentChecksColumn';
import { pickNearbyMapPlaces } from '@/features/weather/utils/nearby-places';
import { loadWeatherBatch } from '@/features/weather/utils/weather-batch-client';
import {
  readLocalWeatherCache,
  writeLocalWeatherCache,
} from '@/features/weather/utils/weather-cache';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { DASHBOARD_CURRENT_MAX_AGE_MS } from '@/constants/weather';
import {
  PLATFORM_SHOWCASE_CITIES,
  SHOW_DEMO_POPULAR_SEARCHES,
} from '@/constants/platform';
import { SPACING } from '@/constants/design-tokens';
import { haversineKm } from '@/lib/geo/distance';
import { cacheMeetsMaxAge } from '@/lib/weather-cache-age';
import { buildCityId, cn } from '@/lib/utils';
import { fetchJson } from '@/lib/client/fetch-json';

const COLUMN_LIMIT = 5;
/** Keep Meridian search list distinct from the nearby column. */
const NEARBY_EXCLUSION_KM = 100;
const HERO_SEARCH_INPUT_ID = 'city-search';

function focusHeroSearch() {
  if (typeof window === 'undefined') {
    return;
  }

  window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
  window.setTimeout(() => {
    document.getElementById(HERO_SEARCH_INPUT_ID)?.focus();
  }, 250);
}

function toDemoPopularChecks() {
  return PLATFORM_SHOWCASE_CITIES.slice(0, COLUMN_LIMIT).map((city) => ({
    cityId: buildCityId(city.name, city.country, city.lat),
    cityName: city.name,
    country: city.country,
    lat: city.lat,
    lon: city.lon,
    temperature: null,
    description: null,
    condition: null,
    icon: null,
    fetchedAt: null,
    source: 'demo',
  }));
}

function toNearbyChecks(places, batchCities) {
  return places.map((place, index) => {
    const entry = batchCities?.[index];
    const current = entry?.scopes?.current?.data ?? null;
    const meta = entry?.scopes?.current?.meta ?? null;

    return {
      cityId: buildCityId(place.name, place.country ?? 'XX', place.lat),
      cityName: place.name,
      country: place.country,
      lat: place.lat,
      lon: place.lon,
      distanceKm: place.distanceKm,
      temperature: current?.temperature ?? null,
      description: current?.description ?? null,
      condition: current?.condition ?? null,
      icon: current?.icon ?? null,
      fetchedAt: meta?.fetchedAt ?? null,
      source: 'nearby',
    };
  });
}

function readNearbyFromLocalCache(places) {
  return places.map((place) => {
    const cityId = buildCityId(place.name, place.country ?? 'XX', place.lat);
    const cached = readLocalWeatherCache(cityId, 'current');
    const fresh = cacheMeetsMaxAge(
      { meta: { fetchedAt: cached?.fetchedAt ?? null } },
      DASHBOARD_CURRENT_MAX_AGE_MS,
    );
    const payload = fresh ? cached?.payload : null;

    return {
      cityId,
      cityName: place.name,
      country: place.country,
      lat: place.lat,
      lon: place.lon,
      distanceKm: place.distanceKm,
      temperature: payload?.temperature ?? null,
      description: payload?.description ?? null,
      condition: payload?.condition ?? null,
      icon: payload?.icon ?? null,
      fetchedAt: cached?.fetchedAt ?? null,
      source: 'nearby',
      fromCache: Boolean(payload),
    };
  });
}

export function RecentChecksSection() {
  const t = useTranslations('Dashboard.recentChecks');
  const { profile } = useUserLocationProfile();
  const [meridianChecks, setMeridianChecks] = useState([]);
  const [meridianLoading, setMeridianLoading] = useState(true);
  const [nearbyChecks, setNearbyChecks] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  const homeLat = profile?.lat ?? null;
  const homeLon = profile?.lon ?? null;
  const homeName = profile?.name ?? null;
  const hasHomeCoords = Number.isFinite(homeLat) && Number.isFinite(homeLon);

  const nearbyPlaces = useMemo(() => {
    if (!hasHomeCoords) {
      return [];
    }
    return pickNearbyMapPlaces(homeLat, homeLon, {
      excludeName: homeName,
      limit: COLUMN_LIMIT,
      minDistanceKm: 2,
      maxDistanceKm: 120,
    });
  }, [hasHomeCoords, homeLat, homeLon, homeName]);

  useEffect(() => {
    let cancelled = false;

    async function loadMeridianSearches() {
      setMeridianLoading(true);
      try {
        const payload = await fetchJson('/api/recent-checks');
        const raw = payload.checks ?? [];
        const nearbyKeys = new Set(
          nearbyPlaces.map((place) => `${place.name}|${place.country}`.toLowerCase()),
        );

        const filtered = raw.filter((check) => {
          const key = `${check.cityName}|${check.country}`.toLowerCase();
          if (nearbyKeys.has(key)) {
            return false;
          }
          if (hasHomeCoords && Number.isFinite(check.lat) && Number.isFinite(check.lon)) {
            if (haversineKm(homeLat, homeLon, check.lat, check.lon) < NEARBY_EXCLUSION_KM) {
              return false;
            }
          }
          return true;
        });

        if (!cancelled) {
          setMeridianChecks(filtered.slice(0, COLUMN_LIMIT));
        }
      } catch {
        if (!cancelled) {
          setMeridianChecks([]);
        }
      } finally {
        if (!cancelled) {
          setMeridianLoading(false);
        }
      }
    }

    void loadMeridianSearches();

    function handleFocus() {
      void loadMeridianSearches();
    }

    window.addEventListener('focus', handleFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleFocus);
    };
  }, [nearbyPlaces, hasHomeCoords, homeLat, homeLon]);

  useEffect(() => {
    let cancelled = false;

    if (!hasHomeCoords || nearbyPlaces.length === 0) {
      setNearbyChecks([]);
      setNearbyLoading(false);
      return undefined;
    }

    const localChecks = readNearbyFromLocalCache(nearbyPlaces);
    if (localChecks.some((check) => check.fromCache)) {
      setNearbyChecks(localChecks);
      setNearbyLoading(false);
    } else {
      setNearbyLoading(true);
    }

    const placesToFetch = nearbyPlaces.filter((_, index) => !localChecks[index]?.fromCache);
    if (placesToFetch.length === 0) {
      return undefined;
    }

    setNearbyLoading(true);

    loadWeatherBatch(
      placesToFetch.map((place) => ({
        lat: place.lat,
        lon: place.lon,
        scopes: ['current'],
        maxAgeMs: DASHBOARD_CURRENT_MAX_AGE_MS,
      })),
      { trigger: WEATHER_CHECK_TRIGGERS.dashboardLoad },
    )
      .then((payload) => {
        if (cancelled) {
          return;
        }

        for (let index = 0; index < placesToFetch.length; index += 1) {
          const place = placesToFetch[index];
          const current = payload.cities?.[index]?.scopes?.current;
          if (place && current?.data) {
            writeLocalWeatherCache(
              buildCityId(place.name, place.country ?? 'XX', place.lat),
              'current',
              {
                payload: current.data,
                fetchedAt: current.meta?.fetchedAt ?? new Date().toISOString(),
              },
            );
          }
        }

        const fetched = toNearbyChecks(placesToFetch, payload.cities ?? []);
        const byId = new Map(fetched.map((check) => [check.cityId, check]));
        setNearbyChecks(
          localChecks.map((check) => (check.fromCache ? check : (byId.get(check.cityId) ?? check))),
        );
      })
      .catch(() => {
        if (!cancelled && !localChecks.some((check) => check.fromCache)) {
          setNearbyChecks(toNearbyChecks(nearbyPlaces, []));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setNearbyLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasHomeCoords, nearbyPlaces]);

  const popularChecks = useMemo(() => {
    if (meridianChecks.length > 0) {
      return meridianChecks;
    }
    if (!meridianLoading && SHOW_DEMO_POPULAR_SEARCHES) {
      return toDemoPopularChecks();
    }
    return [];
  }, [meridianChecks, meridianLoading]);

  const showPopularEmptyAction = popularChecks.length === 0 && !meridianLoading;

  return (
    <section className={cn('flex flex-col', SPACING.stack4)}>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
        <RecentChecksColumn
          title={t('nearYouTitle')}
          description={t('nearYouDescription')}
          empty={hasHomeCoords ? t('nearYouEmpty') : t('nearYouNeedLocation')}
          checks={nearbyChecks}
          isLoading={hasHomeCoords && nearbyLoading}
        />
        <RecentChecksColumn
          title={t('popularSearchesTitle')}
          description={t('popularSearchesDescription')}
          empty={t('popularSearchesEmpty')}
          emptyActionLabel={showPopularEmptyAction ? t('popularSearchesEmptyCta') : null}
          onEmptyAction={showPopularEmptyAction ? focusHeroSearch : null}
          checks={popularChecks}
          isLoading={meridianLoading}
        />
      </div>
    </section>
  );
}
