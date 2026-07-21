'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import '@/features/weather/components/city-detail-osm-backdrop.css';
import { cn } from '@/lib/utils';

export { isCityHeroOsmEnabled } from '@/lib/city-hero-flags';

/**
 * Satellite map at lat/lon (Esri World Imagery via Leaflet).
 * Optional live cloud / precip layers via OpenWeather tile proxy (server key).
 * Optional NASA Black Marble city lights + night darken (under clouds).
 * Set NEXT_PUBLIC_CITY_HERO_OSM=0 to disable (falls back to photos).
 */

/** Wider context than street-level OSM. */
const CITY_OVERVIEW_ZOOM = 10;

/** NASA GIBS Black Marble native max zoom. */
const CITY_LIGHTS_MAX_NATIVE_ZOOM = 8;

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function centersDiffer(map, lat, lon, zoom) {
  const center = map.getCenter();
  const targetZoom = Number.isFinite(zoom) ? zoom : CITY_OVERVIEW_ZOOM;
  return (
    Math.abs(center.lat - lat) > 0.00015
    || Math.abs(center.lng - lon) > 0.00015
    || Math.abs(map.getZoom() - targetZoom) > 0.05
  );
}

/**
 * @param {{
 *   lat: number,
 *   lon: number,
 *   showScrim?: boolean,
 *   showClouds?: boolean,
 *   showPrecipitation?: boolean,
 *   showCityLights?: boolean,
 *   cloudOpacity?: number,
 *   precipOpacity?: number,
 *   lightsOpacity?: number,
 *   nightDarkOpacity?: number,
 *   zoom?: number,
 *   interactive?: boolean,
 *   minZoom?: number,
 *   maxZoom?: number,
 *   onMapReady?: ((map: import('leaflet').Map) => void) | null,
 *   onMapDestroy?: (() => void) | null,
 *   showControls?: boolean,
 *   fadeIn?: boolean,
 * }} props
 */
export function CityDetailOsmBackdrop({
  lat,
  lon,
  showScrim = true,
  showClouds = true,
  showPrecipitation = false,
  showCityLights = false,
  cloudOpacity = 0.62,
  precipOpacity = 0.38,
  lightsOpacity = 0,
  nightDarkOpacity = 0,
  zoom = CITY_OVERVIEW_ZOOM,
  interactive = false,
  minZoom = null,
  maxZoom = null,
  onMapReady = null,
  onMapDestroy = null,
  showControls = false,
  fadeIn = true,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const cloudLayerRef = useRef(null);
  const precipLayerRef = useRef(null);
  const lightsLayerRef = useRef(null);
  const nightDarkElRef = useRef(null);
  const onMapReadyRef = useRef(onMapReady);
  const onMapDestroyRef = useRef(onMapDestroy);
  const viewRef = useRef({ lat, lon, zoom });
  const opacityRef = useRef({
    cloudOpacity,
    precipOpacity,
    lightsOpacity,
    nightDarkOpacity,
  });
  const [mapReady, setMapReady] = useState(!fadeIn);
  onMapReadyRef.current = onMapReady;
  onMapDestroyRef.current = onMapDestroy;
  viewRef.current = { lat, lon, zoom };
  opacityRef.current = {
    cloudOpacity,
    precipOpacity,
    lightsOpacity,
    nightDarkOpacity,
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !Number.isFinite(viewRef.current.lat) || !Number.isFinite(viewRef.current.lon)) {
      return undefined;
    }

    let cancelled = false;
    let resizeObserver = null;
    let loadFallbackTimer = null;

    async function mountMap() {
      const leaflet = await import('leaflet');
      if (cancelled || !containerRef.current) {
        return;
      }

      const L = leaflet.default ?? leaflet;
      const mapZoom = Number.isFinite(viewRef.current.zoom)
        ? viewRef.current.zoom
        : CITY_OVERVIEW_ZOOM;
      const resolvedMinZoom = Number.isFinite(minZoom) ? minZoom : interactive ? mapZoom - 2 : 1;
      const resolvedMaxZoom = Number.isFinite(maxZoom) ? maxZoom : interactive ? mapZoom + 2 : 19;

      const map = L.map(containerRef.current, {
        center: [viewRef.current.lat, viewRef.current.lon],
        zoom: mapZoom,
        minZoom: resolvedMinZoom,
        maxZoom: resolvedMaxZoom,
        zoomControl: showControls,
        attributionControl: showControls,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: false,
        keyboard: false,
        touchZoom: interactive,
      });

      // Pane stack: satellite → nightDark → cityLights → clouds → precip
      const satellitePane = map.createPane('meridianSatellite');
      satellitePane.style.zIndex = 200;

      const satellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          pane: 'meridianSatellite',
          attribution: showControls
            ? 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
            : undefined,
        },
      ).addTo(map);

      function revealMap() {
        if (cancelled) {
          return;
        }
        setMapReady(true);
        // Class updates on the fade wrapper can race layout; remeasure after paint.
        requestAnimationFrame(() => {
          mapRef.current?.invalidateSize?.({ animate: false });
        });
      }

      if (fadeIn) {
        setMapReady(false);
        satellite.once('load', revealMap);
        loadFallbackTimer = window.setTimeout(revealMap, 1800);
      }

      if (showCityLights) {
        const nightPane = map.createPane('meridianNightDark');
        nightPane.style.zIndex = 250;
        nightPane.style.pointerEvents = 'none';

        const darkEl = L.DomUtil.create('div', 'meridian-night-dark-overlay');
        darkEl.style.cssText = [
          'position:absolute',
          'inset:0',
          'background:rgb(2 6 18)',
          `opacity:${opacityRef.current.nightDarkOpacity}`,
          'pointer-events:none',
          'transition:opacity 0.35s ease',
        ].join(';');
        nightPane.appendChild(darkEl);
        nightDarkElRef.current = darkEl;

        const lightsPane = map.createPane('meridianCityLights');
        lightsPane.style.zIndex = 300;
        lightsPane.style.pointerEvents = 'none';

        const lights = L.tileLayer('/api/weather/night-lights/{z}/{x}/{y}', {
          maxZoom: 19,
          maxNativeZoom: CITY_LIGHTS_MAX_NATIVE_ZOOM,
          opacity: opacityRef.current.lightsOpacity,
          pane: 'meridianCityLights',
          className: 'meridian-city-lights-tiles',
        }).addTo(map);
        lightsLayerRef.current = lights;
      }

      if (showClouds) {
        const cloudsPane = map.createPane('meridianClouds');
        cloudsPane.style.zIndex = 400;

        const clouds = L.tileLayer('/api/weather/map-tile/clouds_new/{z}/{x}/{y}', {
          maxZoom: 19,
          opacity: opacityRef.current.cloudOpacity,
          pane: 'meridianClouds',
          className: 'meridian-cloud-tiles',
        }).addTo(map);
        cloudLayerRef.current = clouds;
      }

      if (showPrecipitation) {
        const precipPane = map.createPane('meridianPrecip');
        precipPane.style.zIndex = 450;

        const precip = L.tileLayer('/api/weather/map-tile/precipitation_new/{z}/{x}/{y}', {
          maxZoom: 19,
          opacity: opacityRef.current.precipOpacity,
          pane: 'meridianPrecip',
          className: 'meridian-precip-tiles',
        }).addTo(map);
        precipLayerRef.current = precip;
      }

      mapRef.current = map;

      const invalidate = () => {
        map.invalidateSize({ animate: false });
      };
      requestAnimationFrame(() => {
        invalidate();
        // Sync if Allow Location resolved while Leaflet was still loading.
        const next = viewRef.current;
        if (
          Number.isFinite(next.lat)
          && Number.isFinite(next.lon)
          && centersDiffer(map, next.lat, next.lon, next.zoom)
        ) {
          const nextZoom = Number.isFinite(next.zoom) ? next.zoom : CITY_OVERVIEW_ZOOM;
          map.setView([next.lat, next.lon], nextZoom, { animate: false });
        }
        if (!cancelled) {
          onMapReadyRef.current?.(map);
        }
      });

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(invalidate);
        resizeObserver.observe(containerRef.current);
      }
    }

    mountMap().catch(() => {});

    return () => {
      cancelled = true;
      if (loadFallbackTimer != null) {
        window.clearTimeout(loadFallbackTimer);
      }
      resizeObserver?.disconnect();
      onMapDestroyRef.current?.();
      cloudLayerRef.current = null;
      precipLayerRef.current = null;
      lightsLayerRef.current = null;
      nightDarkElRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      if (fadeIn) {
        setMapReady(false);
      }
    };
  }, [
    showClouds,
    showPrecipitation,
    showCityLights,
    interactive,
    showControls,
    minZoom,
    maxZoom,
    fadeIn,
  ]);

  useEffect(() => {
    cloudLayerRef.current?.setOpacity?.(cloudOpacity);
  }, [cloudOpacity]);

  useEffect(() => {
    precipLayerRef.current?.setOpacity?.(precipOpacity);
  }, [precipOpacity]);

  useEffect(() => {
    lightsLayerRef.current?.setOpacity?.(lightsOpacity);
  }, [lightsOpacity]);

  useEffect(() => {
    if (nightDarkElRef.current) {
      nightDarkElRef.current.style.opacity = String(nightDarkOpacity);
    }
  }, [nightDarkOpacity]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      return;
    }

    const targetZoom = Number.isFinite(zoom) ? zoom : CITY_OVERVIEW_ZOOM;
    if (!centersDiffer(map, lat, lon, targetZoom)) {
      return;
    }

    if (prefersReducedMotion()) {
      map.setView([lat, lon], targetZoom, { animate: false });
      return;
    }

    map.flyTo([lat, lon], targetZoom, {
      animate: true,
      duration: 1.35,
      easeLinearity: 0.25,
    });
  }, [lat, lon, zoom]);

  return (
    <div
      className={cn(
        'absolute inset-0 z-0 overflow-hidden bg-black',
        interactive ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={interactive ? undefined : true}
      aria-label={interactive ? 'Weather map' : undefined}
      role={interactive ? 'region' : undefined}
    >
      {/*
        Fade/ready classes live on this wrapper — never on the Leaflet mount node.
        React className updates were wiping Leaflet's `leaflet-container` class and
        collapsing map panes to 0×0 (solid black hero).
      */}
      <div
        className={cn(
          'absolute inset-0 h-full w-full bg-black meridian-osm-backdrop',
          fadeIn && 'meridian-osm-backdrop--fade',
          fadeIn && mapReady && 'meridian-osm-backdrop--ready',
          '[&_.leaflet-container]:!z-0',
          !showControls && '[&_.leaflet-control-container]:hidden',
          interactive && '[&_.leaflet-container]:cursor-grab [&_.leaflet-container.leaflet-drag-target]:cursor-grabbing',
        )}
      >
        <div
          ref={containerRef}
          className="absolute inset-0 h-full w-full"
        />
      </div>
      {showScrim ? (
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      ) : null}
    </div>
  );
}
