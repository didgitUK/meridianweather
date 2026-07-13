import { describe, expect, it } from 'vitest';
import { runUpstreamStrategies } from '@/lib/weather/upstream-strategies';

describe('runUpstreamStrategies', () => {
  it('returns the first successful strategy result', async () => {
    const result = await runUpstreamStrategies([
      async () => {
        throw new Error('skip');
      },
      async () => ({ payload: { ok: true }, source: 'second' }),
      async () => ({ payload: { ok: false }, source: 'third' }),
    ]);

    expect(result.source).toBe('second');
    expect(result.payload.ok).toBe(true);
  });

  it('throws the last error when every strategy fails', async () => {
    await expect(
      runUpstreamStrategies([
        async () => {
          throw new Error('first');
        },
        async () => {
          throw new Error('second');
        },
      ]),
    ).rejects.toThrow('second');
  });
});
