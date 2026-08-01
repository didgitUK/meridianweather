'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import '@/features/weather/components/city-detail-osm-backdrop.css';
import { cn } from '@/lib/utils';
import { GIBS_BLACK_MARBLE_MAX_ZOOM } from '@/lib/weather/night-lights-tile';
import { fetchLatestRadarFrame } from '@/lib/weather/rainviewer';
import { diurnalWashStyle } from '@/features/weather/utils/hero-weather-timeline';

export { isCityHeroOsmEnabled } from '@/lib/city-hero-flags';

/**
 * Satellite map at lat/lon (Esri World Imagery via Leaflet).
 * Optional live cloud / precip layers via OpenWeather tile proxy (server key).
 * Optional NASA Black Marble city lights + night darken (under clouds).
 * Optional RainViewer live radar under OWM precip intensity.
 * Set NEXT_PUBLIC_CITY_HERO_OSM=0 to disable (falls back to photos).
 */

/** Wider context than street-level OSM. */
export const CITY_OVERVIEW_ZOOM = 10;

/** NASA GIBS Black Marble native max zoom — heroes with lights should match. */
export const CITY_LIGHTS_MAX_NATIVE_ZOOM = GIBS_BLACK_MARBLE_MAX_ZOOM;

/** Hero theater zoom when city lights are shown (native Black Marble). */
export const HERO_LIGHTS_ZOOM = CITY_LIGHTS_MAX_NATIVE_ZOOM;

/** Transparent 1×1 PNG for failed overlay tiles. */
const EMPTY_TILE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const ESRI_ATTR = 'Esri World Imagery';
const NASA_ATTR = 'NASA Black Marble';
const OWM_ATTR = 'OpenWeather';
const RAIN_ATTR = 'RainViewer';

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

function applyWashStyle(el, { wash, washColor }) {
  if (!el) {
    return;
  }
  if (washColor) {
    el.style.background = washColor;
  }
  el.style.opacity = String(wash ?? 0);
}

function applySatFilter(pane, satFilter) {
  if (!pane) {
    return;
  }
  pane.style.filter = satFilter || 'none';
}

/**
 * @param {{
 *   lat: number,
 *   lon: number,
 *   showScrim?: boolean,
 *   showClouds?: boolean,
 *   showPrecipitation?: boolean,
 *   showLiveRadar?: boolean,
 *   showCityLights?: boolean,
 *   showAttribution?: boolean,
 *   cloudOpacity?: number,
 *   precipOpacity?: number,
 *   lightsOpacity?: number,
 *   nightDarkOpacity?: number,
 *   washColor?: string | null,
 *   satFilter?: string | null,
 *   dayGibsOpacity?: number,
 *   showDayGibs?: boolean,
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
  showLiveRadar = null,
  showCityLights = false,
  showAttribution = null,
  cloudOpacity = 0.62,
  precipOpacity = 0.38,
  lightsOpacity = 0,
  nightDarkOpacity = 0,
  washColor = null,
  satFilter = null,
  dayGibsOpacity = 0,
  showDayGibs = false,
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
  const radarLayerRef = useRef(null);
  const dayGibsLayerRef = useRef(null);
  const lightsLayerRef = useRef(null);
  const nightDarkElRef = useRef(null);
  const satellitePaneRef = useRef(null);
  const onMapReadyRef = useRef(onMapReady);
  const onMapDestroyRef = useRef(onMapDestroy);
  const liveRadarEnabled = showLiveRadar ?? showPrecipitation;
  const attributionEnabled = showAttribution ?? !showControls;
  const viewRef = useRef({ lat, lon, zoom });
  const opacityRef = useRef({
    cloudOpacity,
    precipOpacity,
    lightsOpacity,
    nightDarkOpacity,
    washColor,
    satFilter,
    dayGibsOpacity,
  });
  const [mapReady, setMapReady] = useState(!fadeIn);
  const [radarReady, setRadarReady] = useState(false);
  onMapReadyRef.current = onMapReady;
  onMapDestroyRef.current = onMapDestroy;
  viewRef.current = { lat, lon, zoom };
  opacityRef.current = {
    cloudOpacity,
    precipOpacity,
    lightsOpacity,
    nightDarkOpacity,
    washColor,
    satFilter,
    dayGibsOpacity,
  };

  const attributionText = useMemo(() => {
    const parts = [ESRI_ATTR];
    if (showDayGibs) {
      parts.push('NASA GIBS');
    }
    if (showCityLights) {
      parts.push(NASA_ATTR);
    }
    if (showClouds || showPrecipitation) {
      parts.push(OWM_ATTR);
    }
    if (liveRadarEnabled && radarReady) {
      parts.push(RAIN_ATTR);
    }
    return parts.join(' · ');
  }, [showDayGibs, showCityLights, showClouds, showPrecipitation, liveRadarEnabled, radarReady]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !Number.isFinite(viewRef.current.lat) || !Number.isFinite(viewRef.current.lon)) {
      return undefined;
    }

    let cancelled = false;
    let resizeObserver = null;
    let loadFallbackTimer = null;
    let radarAbort = null;

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

      // Pane stack: satellite → dayGibs → nightDark → cityLights → clouds → radar → precip
      const satellitePane = map.createPane('meridianSatellite');
      satellitePane.style.zIndex = 200;
      satellitePane.classList.add('meridian-satellite-tiles');
      satellitePaneRef.current = satellitePane;
      applySatFilter(satellitePane, opacityRef.current.satFilter);

      const satellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          pane: 'meridianSatellite',
          className: 'meridian-satellite-basemap',
          errorTileUrl: EMPTY_TILE,
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
        requestAnimationFrame(() => {
          mapRef.current?.invalidateSize?.({ animate: false });
        });
      }

      if (fadeIn) {
        setMapReady(false);
        satellite.once('load', revealMap);
        loadFallbackTimer = window.setTimeout(revealMap, 1800);
      }

      if (showDayGibs) {
        const dayPane = map.createPane('meridianDayGibs');
        dayPane.style.zIndex = 220;
        dayPane.style.pointerEvents = 'none';
        // GIBS Web Mercator uses z/y/x (same as Esri). Soft day accent over Esri.
        const dayGibs = L.tileLayer(
          'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
          {
            maxZoom: 19,
            maxNativeZoom: 9,
            opacity: opacityRef.current.dayGibsOpacity,
            pane: 'meridianDayGibs',
            className: 'meridian-day-gibs-tiles',
            errorTileUrl: EMPTY_TILE,
          },
        ).addTo(map);
        dayGibsLayerRef.current = dayGibs;
      }

      if (showCityLights) {
        const nightPane = map.createPane('meridianNightDark');
        nightPane.style.zIndex = 250;
        nightPane.style.pointerEvents = 'none';

        const initialWash = opacityRef.current.washColor
          ?? diurnalWashStyle(
            opacityRef.current.nightDarkOpacity > 0
              ? opacityRef.current.nightDarkOpacity / 0.92
              : 0,
          ).washColor;

        const darkEl = L.DomUtil.create('div', 'meridian-night-dark-overlay');
        darkEl.style.cssText = [
          'position:absolute',
          'inset:0',
          `background:${initialWash}`,
          `opacity:${opacityRef.current.nightDarkOpacity}`,
          'pointer-events:none',
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
          errorTileUrl: EMPTY_TILE,
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
          errorTileUrl: EMPTY_TILE,
        }).addTo(map);
        cloudLayerRef.current = clouds;
      }

      if (liveRadarEnabled) {
        const radarPane = map.createPane('meridianRadar');
        radarPane.style.zIndex = 440;
        radarAbort = new AbortController();
        fetchLatestRadarFrame({ signal: radarAbort.signal }).then((frame) => {
          if (cancelled || !frame?.urlTemplate || !mapRef.current) {
            return;
          }
          const radar = L.tileLayer(frame.urlTemplate, {
            maxZoom: 19,
            maxNativeZoom: 7,
            opacity: Math.min(0.72, opacityRef.current.precipOpacity * 1.15),
            pane: 'meridianRadar',
            className: 'meridian-radar-tiles',
            errorTileUrl: EMPTY_TILE,
          }).addTo(mapRef.current);
          radarLayerRef.current = radar;
          setRadarReady(true);
        });
      }

      if (showPrecipitation) {
        const precipPane = map.createPane('meridianPrecip');
        precipPane.style.zIndex = 450;

        const precip = L.tileLayer('/api/weather/map-tile/precipitation_new/{z}/{x}/{y}', {
          maxZoom: 19,
          opacity: opacityRef.current.precipOpacity * (liveRadarEnabled ? 0.55 : 1),
          pane: 'meridianPrecip',
          className: 'meridian-precip-tiles',
          errorTileUrl: EMPTY_TILE,
        }).addTo(map);
        precipLayerRef.current = precip;
      }

      mapRef.current = map;

      const invalidate = () => {
        map.invalidateSize({ animate: false });
      };
      requestAnimationFrame(() => {
        invalidate();
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
      radarAbort?.abort();
      if (loadFallbackTimer != null) {
        window.clearTimeout(loadFallbackTimer);
      }
      resizeObserver?.disconnect();
      onMapDestroyRef.current?.();
      cloudLayerRef.current = null;
      precipLayerRef.current = null;
      radarLayerRef.current = null;
      dayGibsLayerRef.current = null;
      lightsLayerRef.current = null;
      nightDarkElRef.current = null;
      satellitePaneRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      setRadarReady(false);
      if (fadeIn) {
        setMapReady(false);
      }
    };
  }, [
    showClouds,
    showPrecipitation,
    showCityLights,
    showDayGibs,
    liveRadarEnabled,
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
    dayGibsLayerRef.current?.setOpacity?.(dayGibsOpacity);
  }, [dayGibsOpacity]);

  useEffect(() => {
    const owmFactor = liveRadarEnabled ? 0.55 : 1;
    precipLayerRef.current?.setOpacity?.(precipOpacity * owmFactor);
    if (radarLayerRef.current) {
      radarLayerRef.current.setOpacity?.(Math.min(0.72, precipOpacity * 1.15));
    }
  }, [precipOpacity, liveRadarEnabled]);

  useEffect(() => {
    lightsLayerRef.current?.setOpacity?.(lightsOpacity);
  }, [lightsOpacity]);

  useEffect(() => {
    applyWashStyle(nightDarkElRef.current, {
      wash: nightDarkOpacity,
      washColor: washColor
        ?? diurnalWashStyle(nightDarkOpacity > 0 ? nightDarkOpacity / 0.92 : 0).washColor,
    });
  }, [nightDarkOpacity, washColor]);

  useEffect(() => {
    applySatFilter(
      satellitePaneRef.current,
      satFilter ?? diurnalWashStyle(nightDarkOpacity > 0 ? nightDarkOpacity / 0.92 : 0).satFilter,
    );
  }, [satFilter, nightDarkOpacity]);

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
      {attributionEnabled ? (
        <div className="meridian-map-attribution" aria-hidden>
          {attributionText}
        </div>
      ) : null}
    </div>
  );
}
