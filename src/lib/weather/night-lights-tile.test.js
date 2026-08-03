import { describe, expect, it } from 'vitest';
import {
  GIBS_BLACK_MARBLE_MAX_ZOOM,
  remapBlackMarbleTile,
} from '@/lib/weather/night-lights-tile';

describe('remapBlackMarbleTile', () => {
  it('passes through tiles at or below native max zoom', () => {
    expect(remapBlackMarbleTile(8, 12, 34)).toEqual({
      zoom: 8,
      x: 12,
      y: 34,
      remapped: false,
    });
    expect(remapBlackMarbleTile(5, 1, 2)).toEqual({
      zoom: 5,
      x: 1,
      y: 2,
      remapped: false,
    });
  });

  it('remaps overzoom requests to the parent native tile', () => {
    // z9 child (24, 68) sits in z8 parent (12, 34)
    expect(remapBlackMarbleTile(9, 24, 68)).toEqual({
      zoom: GIBS_BLACK_MARBLE_MAX_ZOOM,
      x: 12,
      y: 34,
      remapped: true,
    });
    expect(remapBlackMarbleTile(9, 25, 69)).toEqual({
      zoom: 8,
      x: 12,
      y: 34,
      remapped: true,
    });
  });

  it('remaps two levels of overzoom', () => {
    expect(remapBlackMarbleTile(10, 48, 136)).toEqual({
      zoom: 8,
      x: 12,
      y: 34,
      remapped: true,
    });
  });
});
