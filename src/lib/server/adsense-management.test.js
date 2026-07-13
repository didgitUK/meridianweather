import { describe, expect, it, vi } from 'vitest';
import { parseReportResult, resolveReportDateBounds } from './adsense-management';

describe('adsense-management helpers', () => {
  it('resolves 7d range ending yesterday UTC', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-12T15:00:00.000Z'));

    const bounds = resolveReportDateBounds('7d');
    expect(bounds.endDate).toEqual({ year: 2026, month: 7, day: 11 });
    expect(bounds.startDate).toEqual({ year: 2026, month: 7, day: 5 });

    vi.useRealTimers();
  });

  it('parses report headers into row objects', () => {
    const parsed = parseReportResult({
      headers: [
        { name: 'DATE', type: 'DIMENSION' },
        { name: 'ESTIMATED_EARNINGS', type: 'METRIC_CURRENCY', currencyCode: 'GBP' },
      ],
      rows: [{ cells: [{ value: '2026-07-01' }, { value: '1.23' }] }],
      totals: { cells: [{ value: '' }, { value: '1.23' }] },
    });

    expect(parsed.currencyCode).toBe('GBP');
    expect(parsed.rows[0]).toEqual({ DATE: '2026-07-01', ESTIMATED_EARNINGS: '1.23' });
    expect(parsed.totals.ESTIMATED_EARNINGS).toBe('1.23');
  });
});
