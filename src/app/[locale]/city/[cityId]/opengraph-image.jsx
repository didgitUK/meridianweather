import { ImageResponse } from 'next/og';
import { BRAND } from '@/constants/brand';
import { resolveCity } from '@/lib/resolve-city';

export const alt = 'City weather forecast';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function CityOpenGraphImage({ params }) {
  const { cityId } = await params;
  const city = resolveCity(decodeURIComponent(cityId));
  const title = city ? `${city.name} weather` : 'City forecast';
  const subtitle = city
    ? [city.state, city.country].filter(Boolean).join(', ')
    : BRAND.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0a0a',
          color: '#fafafa',
          padding: '64px',
        }}
      >
        <div style={{ fontSize: 28, color: '#f59e0b' }}>{BRAND.name}</div>
        <div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          <div style={{ marginTop: 16, fontSize: 36, color: '#d4d4d4' }}>{subtitle}</div>
        </div>
        <div style={{ fontSize: 24, color: '#a3a3a3' }}>{BRAND.domain}</div>
      </div>
    ),
    size,
  );
}
