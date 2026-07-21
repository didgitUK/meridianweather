'use client';

import { useCallback, useEffect, useRef } from 'react';
import { CityDetailOsmBackdrop } from '@/features/weather/components/CityDetailOsmBackdrop';
import { cn } from '@/lib/utils';

const POI_ZOOM = 15;

const CATEGORY_COLORS = Object.freeze({
  family: '#2563eb',
  restaurants: '#c2410c',
  attractions: '#7c3aed',
  outdoors: '#15803d',
  nightlife: '#be185d',
});

/**
 * @param {{
 *   focusPoi: { id: string, name: string, lat: number, lon: number, category: string },
 *   categoryPois: Array<{ id: string, name: string, lat: number, lon: number, category: string }>,
 *   className?: string,
 * }} props
 */
export function PlacePoiMap({ focusPoi, categoryPois, className }) {
  const markersRef = useRef([]);
  const leafletRef = useRef(null);
  const mapRef = useRef(null);

  const clearMarkers = useCallback(() => {
    for (const marker of markersRef.current) {
      marker.remove();
    }
    markersRef.current = [];
  }, []);

  const syncMarkers = useCallback(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !focusPoi) {
      return;
    }

    clearMarkers();

    const pins = categoryPois?.length ? categoryPois : [focusPoi];
    for (const poi of pins) {
      if (!Number.isFinite(poi.lat) || !Number.isFinite(poi.lon)) {
        continue;
      }
      const isFocus = poi.id === focusPoi.id;
      const color = CATEGORY_COLORS[poi.category] ?? '#334155';
      const marker = L.circleMarker([poi.lat, poi.lon], {
        radius: isFocus ? 10 : 7,
        color: '#ffffff',
        weight: isFocus ? 3 : 2,
        fillColor: color,
        fillOpacity: isFocus ? 1 : 0.85,
      });
      marker.bindPopup(
        `<strong>${escapeHtml(poi.name)}</strong>`,
        { closeButton: false },
      );
      if (isFocus) {
        marker.openPopup();
      }
      marker.addTo(map);
      markersRef.current.push(marker);
    }
  }, [categoryPois, clearMarkers, focusPoi]);

  const handleMapReady = useCallback(
    async (map) => {
      mapRef.current = map;
      const leaflet = await import('leaflet');
      leafletRef.current = leaflet.default ?? leaflet;
      syncMarkers();
    },
    [syncMarkers],
  );

  const handleMapDestroy = useCallback(() => {
    clearMarkers();
    mapRef.current = null;
    leafletRef.current = null;
  }, [clearMarkers]);

  useEffect(() => {
    syncMarkers();
  }, [syncMarkers]);

  if (!focusPoi || !Number.isFinite(focusPoi.lat) || !Number.isFinite(focusPoi.lon)) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative isolate h-[min(28rem,70vh)] w-full overflow-hidden rounded-xl border border-border/60 bg-black',
        className,
      )}
    >
      <CityDetailOsmBackdrop
        lat={focusPoi.lat}
        lon={focusPoi.lon}
        zoom={POI_ZOOM}
        interactive
        showControls
        showScrim={false}
        showClouds={false}
        showPrecipitation={false}
        fadeIn={false}
        minZoom={POI_ZOOM - 3}
        maxZoom={18}
        onMapReady={handleMapReady}
        onMapDestroy={handleMapDestroy}
      />
    </div>
  );
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
