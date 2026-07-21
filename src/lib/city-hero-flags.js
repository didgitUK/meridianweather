/**
 * City/dashboard hero feature flags (safe for Server and Client Components).
 * Keep these out of `'use client'` modules so RSC pages can call them.
 */

/**
 * Esri/Leaflet map hero is on by default.
 * Set NEXT_PUBLIC_CITY_HERO_OSM=0 to fall back to photo heroes.
 */
export function isCityHeroOsmEnabled() {
  return process.env.NEXT_PUBLIC_CITY_HERO_OSM !== '0';
}

/**
 * Google Street View hero is opt-in when the map hero is off.
 * Set NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 to enable.
 */
export function isCityHeroStreetViewEnabled() {
  return process.env.NEXT_PUBLIC_CITY_HERO_STREET_VIEW === '1';
}
