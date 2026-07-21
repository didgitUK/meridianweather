'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useHomeLocationWeather } from '@/features/cities/hooks/useHomeLocationWeather';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { pickNearbyMapPlaces } from '@/features/weather/utils/nearby-places';
import { loadWeatherBatch } from '@/features/weather/utils/weather-batch-client';
import {
  readLocalWeatherCache,
  writeLocalWeatherCache,
} from '@/features/weather/utils/weather-cache';
import { stashCheckedCity } from '@/features/cities/utils/checked-city-store';
import { buildPlaceDetailHref } from '@/features/cities/utils/weather-place-href';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { DASHBOARD_CURRENT_MAX_AGE_MS } from '@/constants/weather';
import { cacheMeetsMaxAge } from '@/lib/weather-cache-age';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { buildCityId, cn } from '@/lib/utils';

const NEARBY_LIMIT = 8;
const AUTO_ADVANCE_MS = 3200;
const GAP_PX = 10;

function toNearbyChecks(places, batchCities) {
  return places.map((place, index) => {
    const entry = batchCities?.[index];
    const current = entry?.scopes?.current?.data ?? null;

    return {
      cityId: buildCityId(place.name, place.country ?? 'XX', place.lat),
      cityName: place.name,
      country: place.country,
      lat: place.lat,
      lon: place.lon,
      distanceKm: place.distanceKm,
      temperature: current?.temperature ?? null,
      description: current?.description ?? null,
      icon: current?.icon ?? null,
      seoSlug: place.seoSlug ?? place.slug ?? null,
      state: place.state ?? place.adminArea ?? null,
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
      icon: payload?.icon ?? null,
      fromCache: Boolean(payload),
      seoSlug: place.seoSlug ?? place.slug ?? null,
      state: place.state ?? place.adminArea ?? null,
    };
  });
}

function TinyNearbyCard({ check }) {
  const { formatTemp } = useTemperatureUnit();
  const label = check.cityName ?? 'Nearby';
  const distanceLabel = Number.isFinite(check.distanceKm)
    ? `${Math.round(check.distanceKm)} km`
    : null;
  const href = buildPlaceDetailHref({
    cityId: check.cityId,
    name: check.cityName,
    cityName: check.cityName,
    country: check.country,
    lat: check.lat,
    lon: check.lon,
    state: check.state,
    seoSlug: check.seoSlug,
  });

  const inner = (
    <div className="dashboard-hero__nearby-chip flex h-11 w-full items-center gap-2 rounded-xl px-2.5 text-left">
      {check.icon ? (
        <WeatherIcon
          icon={check.icon}
          alt={check.description ?? ''}
          size={22}
          framed={false}
          className="shrink-0"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-xs leading-tight text-white">{label}</p>
        <p className="truncate text-[0.65rem] leading-tight text-white/70">
          {[formatTemp(check.temperature), distanceLabel].filter(Boolean).join(' · ')}
        </p>
      </div>
    </div>
  );

  if (!href) {
    return <div className="dashboard-hero__nearby-chip-slot shrink-0">{inner}</div>;
  }

  return (
    <Link
      href={href}
      className="dashboard-hero__nearby-chip-slot shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      onClick={() => {
        stashCheckedCity({
          id: check.cityId,
          name: check.cityName,
          country: check.country,
          lat: check.lat,
          lon: check.lon,
        });
      }}
    >
      {inner}
    </Link>
  );
}

/**
 * Compact looping strip of nearby locations under the hero card trio.
 */
export function HeroNearbyLocationsCarousel({ className }) {
  const t = useTranslations('Dashboard.hero');
  const tRecent = useTranslations('Dashboard.recentChecks');
  const tCommon = useTranslations('Common');
  const { profile, hasCoordinates } = useHomeLocationWeather();
  const { reducedMotion } = useAccessibility();
  const [checks, setChecks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const trackRef = useRef(null);
  const pausedRef = useRef(false);

  const homeLat = profile?.lat ?? null;
  const homeLon = profile?.lon ?? null;
  const homeName = profile?.name ?? null;

  const places = useMemo(() => {
    if (!Number.isFinite(homeLat) || !Number.isFinite(homeLon)) {
      return [];
    }
    return pickNearbyMapPlaces(homeLat, homeLon, {
      excludeName: homeName,
      limit: NEARBY_LIMIT,
      minDistanceKm: 2,
      maxDistanceKm: 120,
    });
  }, [homeLat, homeLon, homeName]);

  const loopChecks = useMemo(() => {
    if (checks.length < 2) {
      return checks;
    }
    return [...checks, ...checks];
  }, [checks]);

  useEffect(() => {
    let cancelled = false;

    if (!hasCoordinates || places.length === 0) {
      setChecks([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);

    const localChecks = readNearbyFromLocalCache(places);
    if (localChecks.some((check) => check.fromCache)) {
      setChecks(localChecks);
      setIsLoading(false);
    }

    const placesToFetch = places.filter((_, index) => !localChecks[index]?.fromCache);
    if (placesToFetch.length === 0) {
      return undefined;
    }

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
        const fetched = toNearbyChecks(placesToFetch, payload.cities ?? []);
        const byId = new Map(fetched.map((check) => [check.cityId, check]));
        for (let index = 0; index < placesToFetch.length; index += 1) {
          const place = placesToFetch[index];
          const entry = payload.cities?.[index];
          const current = entry?.scopes?.current;
          if (place && current?.data) {
            writeLocalWeatherCache(buildCityId(place.name, place.country ?? 'XX', place.lat), 'current', {
              payload: current.data,
              fetchedAt: current.meta?.fetchedAt ?? new Date().toISOString(),
            });
          }
        }
        setChecks(
          localChecks.map((check) => (check.fromCache ? check : (byId.get(check.cityId) ?? check))),
        );
      })
      .catch(() => {
        if (!cancelled && !localChecks.some((check) => check.fromCache)) {
          setChecks(toNearbyChecks(places, []));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasCoordinates, places]);

  const getStepWidth = useCallback(() => {
    const track = trackRef.current;
    const first = track?.firstElementChild;
    if (!first) {
      return 160;
    }
    return first.getBoundingClientRect().width + GAP_PX;
  }, []);

  const normalizeScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || checks.length < 2) {
      return;
    }
    const half = track.scrollWidth / 2;
    if (track.scrollLeft >= half) {
      track.scrollLeft -= half;
    }
  }, [checks.length]);

  const scrollNext = useCallback(() => {
    const track = trackRef.current;
    if (!track || checks.length < 2) {
      return;
    }
    track.scrollBy({ left: getStepWidth(), behavior: reducedMotion ? 'auto' : 'smooth' });
    window.setTimeout(normalizeScroll, reducedMotion ? 0 : 420);
  }, [checks.length, getStepWidth, normalizeScroll, reducedMotion]);

  useEffect(() => {
    if (isLoading || checks.length < 2 || reducedMotion) {
      return undefined;
    }

    const id = window.setInterval(() => {
      if (!pausedRef.current) {
        scrollNext();
      }
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(id);
  }, [checks.length, isLoading, reducedMotion, scrollNext]);

  if (!hasCoordinates && !isLoading) {
    return (
      <p className={cn('dashboard-hero__nearby-carousel w-full text-left text-sm text-muted-foreground', className)}>
        {tRecent('nearYouNeedLocation')}
      </p>
    );
  }

  return (
    <div className={cn('dashboard-hero__nearby-carousel pointer-events-auto w-full text-left', className)}>
      {isLoading ? (
        <div className="dashboard-hero__nearby-mask flex gap-2.5" aria-busy="true" aria-label={tCommon('loading')}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="dashboard-hero__nearby-chip-slot h-11 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : loopChecks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tRecent('nearYouEmpty')}</p>
      ) : (
        <div className="dashboard-hero__nearby-mask">
          <div
            ref={trackRef}
            className="flex cursor-grab gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label={t('nearbyCarouselLabel')}
            onScroll={normalizeScroll}
            onMouseEnter={() => {
              pausedRef.current = true;
            }}
            onMouseLeave={() => {
              pausedRef.current = false;
            }}
            onFocus={() => {
              pausedRef.current = true;
            }}
            onBlur={() => {
              pausedRef.current = false;
            }}
          >
            {loopChecks.map((check, index) => (
              <TinyNearbyCard
                key={`${check.cityId}-${index}`}
                check={check}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
