'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { DashboardHeroBackdrop, DashboardHeroAttribution } from '@/features/weather/components/DashboardHeroBackdrop';
import {
  CityDetailOsmBackdrop,
  isCityHeroOsmEnabled,
} from '@/features/weather/components/CityDetailOsmBackdrop';
import {
  HomeLocationWeatherProvider,
  useHomeLocationWeather,
} from '@/features/cities/hooks/useHomeLocationWeather';
import { deriveHeroWeatherScene } from '@/lib/hero-image/hero-weather-scene';
import { fetchPlaceholderBg } from '@/lib/client/fetch-placeholder-bg';
import { SPACING } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';
import '@/features/weather/components/dashboard-hero.css';

const DashboardHeroImageContext = createContext(null);

export function useDashboardHeroImage() {
  return useContext(DashboardHeroImageContext);
}

function heroImageFromPlaceholderPayload(payload) {
  if (!payload) {
    return null;
  }

  const landscape = payload.landscape ?? null;
  const portrait = payload.portrait ?? null;
  const landscapeUrl = landscape?.imageUrl;
  const portraitUrl = portrait?.imageUrl;
  const usableLandscape =
    typeof landscapeUrl === 'string'
    && (landscapeUrl.startsWith('/') || /^https?:\/\//.test(landscapeUrl));
  const usablePortrait =
    typeof portraitUrl === 'string'
    && (portraitUrl.startsWith('/') || /^https?:\/\//.test(portraitUrl));

  if (!usableLandscape && !usablePortrait) {
    return null;
  }

  const sourceUrl =
    payload.sourceUrl
    ?? payload.unsplashUrl
    ?? landscape?.sourceUrl
    ?? landscape?.unsplashUrl
    ?? null;

  return {
    landscape: usableLandscape ? landscape : null,
    portrait: usablePortrait ? portrait : null,
    photographer: payload.photographer ?? landscape?.photographer ?? null,
    photographerUrl: payload.photographerUrl ?? landscape?.photographerUrl ?? null,
    sourceUrl,
    sourceName: payload.sourceName ?? landscape?.sourceName ?? null,
    unsplashUrl: sourceUrl,
  };
}

function buildHeroRequestKey(profile, weatherScene) {
  const city = profile?.name?.trim();
  const country = profile?.country?.trim();
  if (!city || !country) {
    return null;
  }

  const lat = Number(profile?.lat);
  const lon = Number(profile?.lon);
  const latBucket = Number.isFinite(lat) ? lat.toFixed(2) : '';
  const lonBucket = Number.isFinite(lon) ? lon.toFixed(2) : '';
  const state = profile?.state?.trim() ?? '';
  const scene = weatherScene ?? 'none';

  return `${city}|${country}|${state}|${latBucket}|${lonBucket}|${scene}`;
}

/**
 * SSR seed may be IP-based; once the client home location resolves, refresh the
 * hero for that place — and once more when a weather scene is known.
 * Deduped by request key so location/weather chatter cannot re-loop the cascade.
 */
function resolveHomeMapCoords(profile) {
  const lat = Number(profile?.lat);
  const lon = Number(profile?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }
  return { lat, lon };
}

function useResolvedDashboardHeroImage(initialHeroImage, { skipPhotoCascade = false } = {}) {
  const { profile, weather, isLoading } = useHomeLocationWeather();
  const [heroImage, setHeroImage] = useState(initialHeroImage);
  const completedKeyRef = useRef(null);
  const inFlightKeyRef = useRef(null);
  const initialSrcRef = useRef(initialHeroImage?.landscape?.imageUrl ?? null);

  useEffect(() => {
    const nextSrc = initialHeroImage?.landscape?.imageUrl ?? null;
    if (nextSrc !== initialSrcRef.current) {
      initialSrcRef.current = nextSrc;
      setHeroImage(initialHeroImage);
      completedKeyRef.current = null;
      inFlightKeyRef.current = null;
    }
  }, [initialHeroImage]);

  const weatherScene = deriveHeroWeatherScene(weather);
  const requestKey = buildHeroRequestKey(profile, weatherScene);

  useEffect(() => {
    if (skipPhotoCascade || isLoading || !requestKey) {
      return undefined;
    }

    if (
      completedKeyRef.current === requestKey
      || inFlightKeyRef.current === requestKey
    ) {
      return undefined;
    }

    const city = profile?.name?.trim();
    const country = profile?.country?.trim();
    if (!city || !country) {
      return undefined;
    }

    const params = new URLSearchParams({ city, country });
    if (profile?.state) {
      params.set('state', profile.state);
    }
    if (profile?.lat != null && Number.isFinite(Number(profile.lat))) {
      params.set('lat', String(profile.lat));
    }
    if (profile?.lon != null && Number.isFinite(Number(profile.lon))) {
      params.set('lon', String(profile.lon));
    }
    if (weather?.temperature != null && Number.isFinite(Number(weather.temperature))) {
      params.set('temp', String(weather.temperature));
    }
    if (weather?.weatherId != null && Number.isFinite(Number(weather.weatherId))) {
      params.set('weatherId', String(weather.weatherId));
    }
    if (weather?.condition) {
      params.set('condition', weather.condition);
    }
    if (weather?.description) {
      params.set('description', weather.description);
    }
    if (weather?.icon) {
      params.set('icon', weather.icon);
    }

    let cancelled = false;
    const inFlightKey = requestKey;
    inFlightKeyRef.current = inFlightKey;


    fetchPlaceholderBg(params)
      .then((payload) => {
        if (cancelled) {
          return;
        }
        const next = heroImageFromPlaceholderPayload(payload);
        if (next) {
          completedKeyRef.current = inFlightKey;
          setHeroImage(next);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (inFlightKeyRef.current === inFlightKey) {
          inFlightKeyRef.current = null;
        }
      });

    return () => {
      cancelled = true;
    };
    // Only re-resolve when the stable place/scene key changes — not on profile
    // object identity refreshes from storage events.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- profile/weather read for params when requestKey changes
  }, [isLoading, requestKey, skipPhotoCascade]);

  return heroImage;
}

function DashboardHeroSectionInner({ children, heroImage: initialHeroImage = null }) {
  const { profile } = useHomeLocationWeather();
  const mapCoords = resolveHomeMapCoords(profile);
  const useSatellite = isCityHeroOsmEnabled() && Boolean(mapCoords);
  const heroImage = useResolvedDashboardHeroImage(initialHeroImage, {
    skipPhotoCascade: useSatellite,
  });
  const hasPhoto = Boolean(heroImage?.landscape?.imageUrl || heroImage?.portrait?.imageUrl);
  const hasBackdrop = useSatellite || hasPhoto;

  return (
    <DashboardHeroImageContext.Provider value={heroImage}>
      <section
        className={cn(
          // overflow-visible so hero city-search dropdowns can escape card shells;
          // photo clipping stays on the backdrop layer.
          'dashboard-hero relative isolate w-full overflow-visible border-b border-border/60 bg-background',
          hasBackdrop && 'dashboard-hero--has-photo',
          useSatellite && 'dashboard-hero--weather-map',
        )}
      >
        {useSatellite ? (
          <>
            <CityDetailOsmBackdrop
              lat={mapCoords.lat}
              lon={mapCoords.lon}
              showScrim={false}
              showClouds
              showPrecipitation
              cloudOpacity={0.72}
              precipOpacity={0.45}
              zoom={9}
            />
            <div
              aria-hidden
              className="dashboard-hero__satellite-scrim pointer-events-none absolute inset-0 z-[1]"
            />
          </>
        ) : (
          <DashboardHeroBackdrop heroImage={heroImage} />
        )}
        <div
          className={cn(
            'relative z-10 mx-auto flex min-h-[22rem] w-full max-w-6xl flex-col justify-center overflow-visible py-10 sm:min-h-[28rem] sm:py-16 md:min-h-[32rem] md:py-20 lg:min-h-[36rem] lg:py-24',
            SPACING.pageX,
            useSatellite && 'pointer-events-none',
          )}
        >
          {children}
          {useSatellite ? null : <DashboardHeroAttribution heroImage={heroImage} />}
        </div>
      </section>
    </DashboardHeroImageContext.Provider>
  );
}

export function DashboardHeroSection({ children, heroImage = null }) {
  return (
    <HomeLocationWeatherProvider>
      <DashboardHeroSectionInner heroImage={heroImage}>
        {children}
      </DashboardHeroSectionInner>
    </HomeLocationWeatherProvider>
  );
}
