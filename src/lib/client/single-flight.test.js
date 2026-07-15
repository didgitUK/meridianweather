import { describe, expect, it, vi } from 'vitest';
import { clearSingleFlight, singleFlight } from '@/lib/client/single-flight';

describe('singleFlight', () => {
  it('shares one promise across concurrent callers', async () => {
    let calls = 0;
    const factory = vi.fn(async () => {
      calls += 1;
      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
      return 'ok';
    });

    const [a, b] = await Promise.all([
      singleFlight('k', factory),
      singleFlight('k', factory),
    ]);

    expect(a).toBe('ok');
    expect(b).toBe('ok');
    expect(calls).toBe(1);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('allows a new flight after the previous settles', async () => {
    clearSingleFlight('k2');
    let calls = 0;
    const factory = async () => {
      calls += 1;
      return calls;
    };

    await expect(singleFlight('k2', factory)).resolves.toBe(1);
    await expect(singleFlight('k2', factory)).resolves.toBe(2);
  });
});
