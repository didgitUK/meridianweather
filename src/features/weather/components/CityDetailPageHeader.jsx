'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { CityDetailOptionsMenu } from '@/features/cities/components/CityDetailOptionsMenu';
import { countryCodeToFlagEmoji } from '@/features/cities/utils/city-search';
import { CITY_HERO_IMAGE_FALLBACK } from '@/constants/monetization';
import { getHeroSourceLabel } from '@/constants/hero-sources';
import { ICONS, SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { deriveHeroWeatherScene } from '@/lib/hero-image/hero-weather-scene';
import { fetchPlaceholderBg } from '@/lib/client/fetch-placeholder-bg';
import {
  CityDetailOsmBackdrop,
  isCityHeroOsmEnabled,
} from '@/features/weather/components/CityDetailOsmBackdrop';
import {
  CityDetailStreetViewBackdrop,
  isCityHeroStreetViewEnabled,
} from '@/features/weather/components/CityDetailStreetViewBackdrop';
import { cn } from '@/lib/utils';

function resolveHeroDisplayUrl(url) {
  if (typeof url !== 'string' || !url) {
    return null;
  }
  if (/^https?:\/\//.test(url) || url.startsWith('/hero/')) {
    return url;
  }
  return null;
}

function buildHeroImageParams(city, weather = null, { refresh = false, exclude = null } = {}) {
  const params = new URLSearchParams();
  if (city?.name) params.set('city', city.name);
  if (city?.state) params.set('state', city.state);
  if (city?.country) params.set('country', city.country);
  if (city?.lat != null && Number.isFinite(Number(city.lat))) {
    params.set('lat', String(city.lat));
  }
  if (city?.lon != null && Number.isFinite(Number(city.lon))) {
    params.set('lon', String(city.lon));
  }
  if (weather?.temperature != null && Number.isFinite(Number(weather.temperature))) {
    params.set('temp', String(weather.temperature));
  }
  if (weather?.weatherId != null && Number.isFinite(Number(weather.weatherId))) {
    params.set('weatherId', String(weather.weatherId));
  }
  if (weather?.condition) params.set('condition', weather.condition);
  if (weather?.description) params.set('description', weather.description);
  if (weather?.icon) params.set('icon', weather.icon);
  if (refresh) params.set('refresh', '1');
  if (exclude) params.set('exclude', exclude);
  return params;
}

export function CityDetailPageHeader({
  city,
  weather = null,
  isPinned,
  onRerunCheck,
  isRefreshing = false,
  onReportInaccurate,
  isReportActive = false,
  isReporting = false,
  heroImage = null,
  preferPhotoHero = false,
}) {
  const tCommon = useTranslations('Common');
  const locationLabel = [city.state, city.country].filter(Boolean).join(', ');
  const mapLat = Number(city?.lat);
  const mapLon = Number(city?.lon);
  const hasMapCoords = Number.isFinite(mapLat) && Number.isFinite(mapLon);
  const useOsm = !preferPhotoHero && isCityHeroOsmEnabled() && hasMapCoords;
  const useStreetView =
    !useOsm
    && isCityHeroStreetViewEnabled()
    && hasMapCoords;
  const useMapBackdrop = useOsm || useStreetView;
  const initialSrc =
    resolveHeroDisplayUrl(heroImage?.landscape?.imageUrl)
    ?? CITY_HERO_IMAGE_FALLBACK;
  const [imageSrc, setImageSrc] = useState(initialSrc);
  const [credit, setCredit] = useState({
    photographer: heroImage?.landscape?.photographer ?? heroImage?.photographer ?? null,
    sourceUrl:
      heroImage?.landscape?.sourceUrl
      ?? heroImage?.landscape?.unsplashUrl
      ?? heroImage?.sourceUrl
      ?? heroImage?.unsplashUrl
      ?? null,
    sourceName: heroImage?.landscape?.sourceName ?? heroImage?.sourceName ?? null,
  });
  const [isChangingHeroImage, setIsChangingHeroImage] = useState(false);
  const completedHeroKeyRef = useRef(null);
  const weatherScene = deriveHeroWeatherScene(weather);
  const heroRequestKey = [
    city?.name ?? '',
    city?.state ?? '',
    city?.country ?? '',
    city?.lat != null ? Number(city.lat).toFixed(2) : '',
    city?.lon != null ? Number(city.lon).toFixed(2) : '',
    weatherScene ?? 'none',
    resolveHeroDisplayUrl(heroImage?.landscape?.imageUrl) ?? '',
  ].join('|');

  useEffect(() => {
    if (useMapBackdrop) {
      return undefined;
    }

    const fromProp = resolveHeroDisplayUrl(heroImage?.landscape?.imageUrl);
    if (fromProp) {
      setImageSrc(fromProp);
      setCredit({
        photographer: heroImage?.landscape?.photographer ?? heroImage?.photographer ?? null,
        sourceUrl:
          heroImage?.landscape?.sourceUrl
          ?? heroImage?.landscape?.unsplashUrl
          ?? heroImage?.sourceUrl
          ?? heroImage?.unsplashUrl
          ?? null,
        sourceName: heroImage?.landscape?.sourceName ?? heroImage?.sourceName ?? null,
      });
      completedHeroKeyRef.current = heroRequestKey;
      return undefined;
    }

    if (!city?.name && !city?.country) {
      return undefined;
    }

    if (completedHeroKeyRef.current === heroRequestKey) {
      return undefined;
    }

    const params = buildHeroImageParams(city, weather);
    let cancelled = false;
    fetchPlaceholderBg(params)
      .then((payload) => {
        if (cancelled) return;
        const next = resolveHeroDisplayUrl(
          payload?.landscape?.imageUrl ?? payload?.imageUrl,
        );
        if (next) {
          completedHeroKeyRef.current = heroRequestKey;
          setImageSrc(next);
          setCredit({
            photographer: payload?.photographer ?? null,
            sourceUrl: payload?.sourceUrl ?? payload?.unsplashUrl ?? null,
            sourceName: payload?.sourceName ?? null,
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [heroRequestKey, city, weather, heroImage, useMapBackdrop]);

  async function handleChangeHeroImage() {
    if (useMapBackdrop || !city?.country || isChangingHeroImage) {
      return;
    }

    setIsChangingHeroImage(true);
    try {
      const params = buildHeroImageParams(city, weather, {
        refresh: true,
        exclude: resolveHeroDisplayUrl(imageSrc),
      });
      const payload = await fetchPlaceholderBg(params);
      if (!payload) {
        throw new Error('Hero refresh failed');
      }
      const next = resolveHeroDisplayUrl(
        payload?.landscape?.imageUrl ?? payload?.imageUrl,
      );
      if (!next) {
        throw new Error('No hero image');
      }
      completedHeroKeyRef.current = null;
      setImageSrc(next);
      setCredit({
        photographer: payload?.photographer ?? null,
        sourceUrl: payload?.sourceUrl ?? payload?.unsplashUrl ?? null,
        sourceName: payload?.sourceName ?? null,
      });
    } catch {
      toast.message("Couldn't find another photo for this location");
    } finally {
      setIsChangingHeroImage(false);
    }
  }

  return (
    <section
      aria-labelledby="city-detail-title"
      className={cn(
        'relative isolate z-40 w-screen max-w-[100vw] overflow-visible border-b border-border/60',
        // ~half the previous hero band so the forecast starts earlier.
        'ml-[calc(50%-50vw)] aspect-[32/9] min-h-[7rem] max-h-[min(14rem,28vw)]',
      )}
    >
      {useOsm ? (
        <CityDetailOsmBackdrop lat={mapLat} lon={mapLon} />
      ) : useStreetView ? (
        <CityDetailStreetViewBackdrop
          lat={mapLat}
          lon={mapLon}
          title={`${city.name} Street View`}
        />
      ) : (
        <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
          <Image
            key={imageSrc}
            src={imageSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover [filter:none]"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
        </div>
      )}

      <div
        className={cn(
          'relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col justify-between gap-2',
          SPACING.pageX,
          'pb-4 pt-5 sm:pb-5 sm:pt-6',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className={ICONS.sm} aria-hidden />
            {tCommon('backToDashboard')}
          </Link>

          {useOsm ? null : useStreetView ? (
            <p className="max-w-[14rem] text-right text-xs text-white/65 sm:max-w-xs">
              Google Street View
            </p>
          ) : credit?.photographer && credit?.sourceUrl ? (
            <p className="max-w-[14rem] text-right text-xs text-white/65 sm:max-w-xs">
              {tCommon('photoBy')}{' '}
              <a
                href={
                  credit.sourceUrl.includes('?')
                    ? `${credit.sourceUrl}&utm_source=meridian_weather&utm_medium=referral`
                    : `${credit.sourceUrl}?utm_source=meridian_weather&utm_medium=referral`
                }
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-white"
              >
                {credit.photographer}
              </a>
              {' '}
              {tCommon('onSource', { source: getHeroSourceLabel(credit.sourceName) })}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1 text-left">
            <h1
              id="city-detail-title"
              className={cn(TYPOGRAPHY.heading, 'text-3xl tracking-tight text-white sm:text-4xl')}
            >
              {city.name}
            </h1>
            {locationLabel ? (
              <p className={cn('flex items-center gap-2 text-white/85', TYPOGRAPHY.body)}>
                <span className="text-base leading-none" aria-hidden>
                  {countryCodeToFlagEmoji(city.country)}
                </span>
                <span>{locationLabel}</span>
              </p>
            ) : null}
          </div>

          <div className="relative z-50 shrink-0 [&_button:not([role=menuitem])]:border-white/25 [&_button:not([role=menuitem])]:bg-black/35 [&_button:not([role=menuitem])]:text-white [&_button:not([role=menuitem])]:hover:bg-black/55">
            <CityDetailOptionsMenu
              city={city}
              isPinned={isPinned}
              onRerunCheck={onRerunCheck}
              isRefreshing={isRefreshing}
              onChangeHeroImage={useMapBackdrop ? undefined : handleChangeHeroImage}
              isChangingHeroImage={isChangingHeroImage}
              onReportInaccurate={onReportInaccurate}
              isReportActive={isReportActive}
              isReporting={isReporting}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
