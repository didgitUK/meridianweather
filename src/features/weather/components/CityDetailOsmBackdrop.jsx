'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';

/**
 * Satellite map at lat/lon (Esri World Imagery via Leaflet).
 * Optional live cloud / precip layers via OpenWeather tile proxy (server key).
 * Set NEXT_PUBLIC_CITY_HERO_OSM=0 to disable (falls back to photos).
 */
export function isCityHeroOsmEnabled() {
  return process.env.NEXT_PUBLIC_CITY_HERO_OSM !== '0';
}

/** Wider context than street-level OSM. */
const CITY_OVERVIEW_ZOOM = 10;

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
 *   cloudOpacity?: number,
 *   precipOpacity?: number,
 *   zoom?: number,
 *   interactive?: boolean,
 *   minZoom?: number,
 *   maxZoom?: number,
 *   onMapReady?: ((map: import('leaflet').Map) => void) | null,
 *   onMapDestroy?: (() => void) | null,
 * }} props
 */
export function CityDetailOsmBackdrop({
  lat,
  lon,
  showScrim = true,
  showClouds = true,
  showPrecipitation = false,
  cloudOpacity = 0.62,
  precipOpacity = 0.38,
  zoom = CITY_OVERVIEW_ZOOM,
  interactive = false,
  minZoom = null,
  maxZoom = null,
  onMapReady = null,
  onMapDestroy = null,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const onMapReadyRef = useRef(onMapReady);
  const onMapDestroyRef = useRef(onMapDestroy);
  const viewRef = useRef({ lat, lon, zoom });
  onMapReadyRef.current = onMapReady;
  onMapDestroyRef.current = onMapDestroy;
  viewRef.current = { lat, lon, zoom };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !Number.isFinite(viewRef.current.lat) || !Number.isFinite(viewRef.current.lon)) {
      return undefined;
    }

    let cancelled = false;
    let resizeObserver = null;

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
        zoomControl: false,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: false,
        keyboard: false,
        touchZoom: interactive,
      });

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
        },
      ).addTo(map);

      if (showClouds) {
        L.tileLayer('/api/weather/map-tile/clouds_new/{z}/{x}/{y}', {
          maxZoom: 19,
          opacity: cloudOpacity,
          className: 'meridian-cloud-tiles',
        }).addTo(map);
      }

      if (showPrecipitation) {
        L.tileLayer('/api/weather/map-tile/precipitation_new/{z}/{x}/{y}', {
          maxZoom: 19,
          opacity: precipOpacity,
          className: 'meridian-precip-tiles',
        }).addTo(map);
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
      resizeObserver?.disconnect();
      onMapDestroyRef.current?.();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [
    showClouds,
    showPrecipitation,
    cloudOpacity,
    precipOpacity,
    interactive,
    minZoom,
    maxZoom,
  ]);

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
        'absolute inset-0 z-0 overflow-hidden',
        interactive ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={interactive ? undefined : true}
      aria-label={interactive ? 'Weather map' : undefined}
      role={interactive ? 'region' : undefined}
    >
      <div
        ref={containerRef}
        className={cn(
          'absolute inset-0 h-full w-full bg-muted/40',
          // Leaflet panes default to z-index 200–700 and can cover sibling header UI.
          '[&_.leaflet-container]:!z-0 [&_.leaflet-pane]:!z-0 [&_.leaflet-control-container]:hidden',
          interactive && '[&_.leaflet-container]:cursor-grab [&_.leaflet-container.leaflet-drag-target]:cursor-grabbing',
        )}
      />
      {showScrim ? (
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      ) : null}
    </div>
  );
}
