import { ImageResponse } from 'next/og';
import { BRAND } from '@/constants/brand';

export const alt = `${BRAND.name} weather dashboard`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
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
        <div style={{ fontSize: 28, color: '#f59e0b' }}>{BRAND.domain}</div>
        <div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{BRAND.name}</div>
          <div style={{ marginTop: 16, fontSize: 36, color: '#d4d4d4' }}>{BRAND.tagline}</div>
        </div>
        <div style={{ fontSize: 24, color: '#a3a3a3' }}>{BRAND.description}</div>
      </div>
    ),
    size,
  );
}
