import { NextResponse } from 'next/server';
import { getApiKey } from '@/lib/api-client';
import { apiErrorFromCaught } from '@/lib/server/api-response';

/** OpenWeather Weather Maps 1.0 layers we proxy (key stays server-side). */
const ALLOWED_LAYERS = new Set([
  'clouds_new',
  'precipitation_new',
  'temp_new',
  'wind_new',
  'pressure_new',
]);

function parseTileCoord(value, name) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`Invalid ${name}`);
  }
  return n;
}

export async function GET(_request, { params }) {
  try {
    const { layer, z, x, y } = await params;
    const tileLayer = String(layer ?? '');

    if (!ALLOWED_LAYERS.has(tileLayer)) {
      return NextResponse.json({ error: 'Unsupported map layer' }, { status: 400 });
    }

    const zoom = parseTileCoord(z, 'z');
    const tileX = parseTileCoord(x, 'x');
    const tileY = parseTileCoord(String(y).replace(/\.png$/i, ''), 'y');

    if (zoom > 19) {
      return NextResponse.json({ error: 'Zoom out of range' }, { status: 400 });
    }

    const key = getApiKey();
    const upstream = `https://tile.openweathermap.org/map/${tileLayer}/${zoom}/${tileX}/${tileY}.png?appid=${encodeURIComponent(key)}`;
    const response = await fetch(upstream, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Upstream tile unavailable' },
        { status: response.status === 401 || response.status === 403 ? 502 : response.status },
      );
    }

    const bytes = await response.arrayBuffer();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=600, s-maxage=600',
      },
    });
  } catch (error) {
    return apiErrorFromCaught(error);
  }
}
