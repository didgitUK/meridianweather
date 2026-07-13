import { describe, expect, it } from 'vitest';
import { buildCsv } from '@/lib/csv';

describe('buildCsv', () => {
  it('escapes commas and quotes', () => {
    const csv = buildCsv(['name', 'note'], [
      { name: 'Bolton', note: 'ok' },
      { name: 'A, B', note: 'say "hi"' },
    ]);

    expect(csv).toBe('name,note\nBolton,ok\n"A, B","say ""hi"""\n');
  });
});
