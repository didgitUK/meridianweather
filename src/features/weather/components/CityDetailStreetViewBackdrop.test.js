import { describe, expect, it } from 'vitest';
import { buildStreetViewEmbedUrl } from '@/features/weather/components/CityDetailStreetViewBackdrop';

describe('buildStreetViewEmbedUrl', () => {
  it('builds a legacy svembed URL without a Maps API key', () => {
    const url = buildStreetViewEmbedUrl(51.1079, 17.0385);
    expect(url).toContain('maps.google.com/maps?');
    expect(url).toContain('output=svembed');
    expect(url).toContain('cbll=51.1079%2C17.0385');
  });
});
