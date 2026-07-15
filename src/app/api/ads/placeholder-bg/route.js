import { NextResponse } from 'next/server';
import { getHeroImageForRegion } from '@/lib/hero-image/get-hero-image-for-region';
import { getAdPlaceholderImage } from '@/constants/monetization';

function isUsableImageUrl(url) {
  return typeof url === 'string' && (url.startsWith('/') || /^https?:\/\//.test(url));
}

/**
 * Location landscape for AdSense placeholders / city heroes (reuses Unsplash hero cache).
 * GET /api/ads/placeholder-bg?city=&state=&country=&lat=&lon=&refresh=1&exclude=
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city')?.trim() || null;
  const state = searchParams.get('state')?.trim() || null;
  const country = searchParams.get('country')?.trim()?.toUpperCase() || null;
  const lat = Number(searchParams.get('lat'));
  const lon = Number(searchParams.get('lon'));
  const temperature = Number(searchParams.get('temp'));
  const weatherId = Number(searchParams.get('weatherId'));
  const condition = searchParams.get('condition')?.trim() || null;
  const description = searchParams.get('description')?.trim() || null;
  const icon = searchParams.get('icon')?.trim() || null;
  const force = searchParams.get('refresh') === '1';
  const excludeLandscapeUrl = searchParams.get('exclude')?.trim() || null;
  const fallback = getAdPlaceholderImage('default');

  if (!country) {
    return NextResponse.json({
      imageUrl: fallback,
      source: 'fallback',
      landscape: null,
      portrait: null,
    });
  }

  try {
    const hero = await getHeroImageForRegion(
      {
        city,
        state,
        country,
        lat: Number.isFinite(lat) ? lat : null,
        lon: Number.isFinite(lon) ? lon : null,
        temperature: Number.isFinite(temperature) ? temperature : null,
        weatherId: Number.isFinite(weatherId) ? weatherId : null,
        condition,
        description,
        icon,
      },
      {
        force,
        excludeLandscapeUrl: force ? excludeLandscapeUrl : null,
      },
    );
    const landscape = hero?.landscape ?? null;
    const portrait = hero?.portrait ?? null;
    const landscapeUrl = landscape?.imageUrl ?? null;
    const isRemote = typeof landscapeUrl === 'string' && /^https?:\/\//.test(landscapeUrl);
    const hasHeroVisual = isUsableImageUrl(landscapeUrl) || isUsableImageUrl(portrait?.imageUrl);
    // Prefer the real hero asset (including /hero/*.svg). Only use ad chrome PNG when
    // there is no usable landscape at all — never replace a static hero with BannerAds.
    const publicImageUrl = isUsableImageUrl(landscapeUrl)
      ? landscapeUrl
      : (isUsableImageUrl(portrait?.imageUrl) ? portrait.imageUrl : fallback);

    const sourceUrl =
      landscape?.sourceUrl
      ?? landscape?.unsplashUrl
      ?? hero?.sourceUrl
      ?? hero?.unsplashUrl
      ?? null;
    const sourceName = landscape?.sourceName ?? hero?.sourceName ?? null;

    return NextResponse.json({
      imageUrl: publicImageUrl,
      source: hasHeroVisual ? (isRemote ? 'hero' : 'static') : 'fallback',
      queryUsed: landscape?.queryUsed ?? hero?.queryUsed ?? null,
      photographer: landscape?.photographer ?? hero?.photographer ?? null,
      photographerUrl: landscape?.photographerUrl ?? hero?.photographerUrl ?? null,
      sourceUrl,
      sourceName,
      unsplashUrl: sourceUrl,
      landscape: hasHeroVisual ? landscape : null,
      portrait: hasHeroVisual ? portrait : null,
    });
  } catch {
    return NextResponse.json({
      imageUrl: fallback,
      source: 'fallback',
      landscape: null,
      portrait: null,
    });
  }
}
