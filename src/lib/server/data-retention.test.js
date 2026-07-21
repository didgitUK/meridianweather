import { describe, expect, it, vi, beforeEach } from 'vitest';

const runMock = vi.fn(() => ({ changes: 3 }));
const prepareMock = vi.fn(() => ({ run: runMock }));

vi.mock('@/lib/db', () => ({
  getDb: () => ({ prepare: prepareMock }),
}));

describe('data-retention', () => {
  beforeEach(() => {
    runMock.mockClear();
    prepareMock.mockClear();
    delete process.env.RETENTION_ANALYTICS_DAYS;
  });

  it('purges configured observability tables', async () => {
    const { purgeExpiredObservabilityData } = await import('@/lib/server/data-retention');
    const result = purgeExpiredObservabilityData(Date.parse('2026-07-21T00:00:00.000Z'));
    expect(prepareMock).toHaveBeenCalled();
    expect(result.deleted.site_analytics_events).toBe(3);
    expect(result.policy.analyticsDays).toBe(90);
  });
});
