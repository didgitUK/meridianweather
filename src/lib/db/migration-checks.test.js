import { describe, it, expect } from 'vitest';
import { getDb } from '@/lib/db';

describe('db migration', () => {
  it('adds checks log columns and drops unique', () => {
    const db = getDb();
    const cols = db.prepare('PRAGMA table_info(location_weather_checks)').all().map((c) => c.name);
    expect(cols).toEqual(expect.arrayContaining(['trigger', 'cache_outcome', 'tokens_used']));
    const tableSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='location_weather_checks'").get()?.sql ?? '';
    expect(tableSql.includes('UNIQUE(location_id, scope, observed_at)')).toBe(false);
  });
});
