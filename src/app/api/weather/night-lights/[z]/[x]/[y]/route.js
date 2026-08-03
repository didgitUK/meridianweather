import { NextResponse } from 'next/server';
import { apiErrorFromCaught } from '@/lib/server/api-response';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import {
  GIBS_BLACK_MARBLE_MAX_ZOOM,
  remapBlackMarbleTile,
} from '@/lib/weather/night-lights-tile';

const GIBS_TEMPLATE =
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/default/GoogleMapsCompatible_Level8';

function parseTileCoord(value, name) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`Invalid ${name}`);
  }
  return n;
}

/**
 * Proxy NASA Black Marble city-lights tiles (georeferenced night lights).
 * GIBS tile path is z/y/x; Leaflet clients send z/x/y.
 * Overzoom (z > 8) remaps to the parent native tile instead of 400.
 */
export async function GET(request, { params }) {
  const limited = enforceRateLimit(request, {
    bucket: 'night-lights',
    limit: 240,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  try {
    const { z, x, y } = await params;
    const zoom = parseTileCoord(z, 'z');
    const tileX = parseTileCoord(x, 'x');
    const tileY = parseTileCoord(String(y).replace(/\.(png|jpg|jpeg)$/i, ''), 'y');

    if (zoom > 19) {
      return NextResponse.json({ error: 'Zoom out of range' }, { status: 400 });
    }

    const maxIndex = 2 ** zoom;
    if (tileX >= maxIndex || tileY >= maxIndex) {
      return NextResponse.json({ error: 'Tile out of range' }, { status: 400 });
    }

    const native = remapBlackMarbleTile(zoom, tileX, tileY, GIBS_BLACK_MARBLE_MAX_ZOOM);

    // GIBS GoogleMapsCompatible: TileMatrix / TileRow / TileCol → z / y / x
    const upstream = `${GIBS_TEMPLATE}/${native.zoom}/${native.y}/${native.x}.png`;
    const response = await fetch(upstream, {
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Upstream night-lights tile unavailable' },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    const bytes = await response.arrayBuffer();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        ...(native.remapped ? { 'X-Tile-Remapped': '1' } : {}),
      },
    });
  } catch (error) {
    return apiErrorFromCaught(error);
  }
}
