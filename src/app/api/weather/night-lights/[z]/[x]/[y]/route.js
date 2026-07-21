import { NextResponse } from 'next/server';
import { apiErrorFromCaught } from '@/lib/server/api-response';

/** NASA GIBS VIIRS Black Marble — max native zoom Level8. */
const GIBS_BLACK_MARBLE_MAX_ZOOM = 8;
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
 */
export async function GET(_request, { params }) {
  try {
    const { z, x, y } = await params;
    const zoom = parseTileCoord(z, 'z');
    const tileX = parseTileCoord(x, 'x');
    const tileY = parseTileCoord(String(y).replace(/\.(png|jpg|jpeg)$/i, ''), 'y');

    if (zoom > GIBS_BLACK_MARBLE_MAX_ZOOM) {
      return NextResponse.json({ error: 'Zoom out of range' }, { status: 400 });
    }

    // GIBS GoogleMapsCompatible: TileMatrix / TileRow / TileCol → z / y / x
    const upstream = `${GIBS_TEMPLATE}/${zoom}/${tileY}/${tileX}.png`;
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
      },
    });
  } catch (error) {
    return apiErrorFromCaught(error);
  }
}
