import { describe, expect, it } from 'vitest';
import { buildSnapshotKey } from '@/lib/weather-snapshot-repo';

describe('buildSnapshotKey', () => {
  it('keeps default ttl class keys unchanged for english', () => {
    expect(buildSnapshotKey(51.5074, -0.1278, 'current', 'en')).toBe(
      '51.5074,-0.1278,current',
    );
    expect(buildSnapshotKey(51.5074, -0.1278, 'current', 'en', 'default')).toBe(
      '51.5074,-0.1278,current',
    );
  });

  it('isolates seo ttl class from default keys', () => {
    expect(buildSnapshotKey(51.5074, -0.1278, 'current', 'en', 'seo')).toBe(
      '51.5074,-0.1278,current@seo',
    );
    expect(buildSnapshotKey(51.5074, -0.1278, 'daily', 'de', 'seo')).toBe(
      '51.5074,-0.1278,daily,de@seo',
    );
  });
});
