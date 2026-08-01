/** NASA GIBS VIIRS Black Marble — max native zoom Level8. */
export const GIBS_BLACK_MARBLE_MAX_ZOOM = 8;

/**
 * Remap an XYZ tile request onto Black Marble's native zoom.
 * When z > max, returns the parent tile at native zoom (defensive overzoom).
 * Leaflet should prefer maxNativeZoom; this avoids hard 400s if it does not.
 *
 * @param {number} zoom
 * @param {number} tileX
 * @param {number} tileY
 * @param {number} [maxZoom]
 * @returns {{ zoom: number, x: number, y: number, remapped: boolean }}
 */
export function remapBlackMarbleTile(
  zoom,
  tileX,
  tileY,
  maxZoom = GIBS_BLACK_MARBLE_MAX_ZOOM,
) {
  if (zoom <= maxZoom) {
    return { zoom, x: tileX, y: tileY, remapped: false };
  }

  const delta = zoom - maxZoom;
  return {
    zoom: maxZoom,
    x: tileX >> delta,
    y: tileY >> delta,
    remapped: true,
  };
}
