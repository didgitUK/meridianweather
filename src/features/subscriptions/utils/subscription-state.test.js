import { describe, expect, it } from 'vitest';
import {
  clearCitySubscriptions,
  getButtonLabel,
  getCitySubscriptionState,
  hasActiveCitySubscriptions,
  mergeSubscriptionOnSuccess,
} from '@/features/subscriptions/utils/subscription-state';

describe('subscription-state', () => {
  const baseRegistry = {
    email: 'user@example.com',
    newsletter: null,
    cities: {
      'dubai-AE-25.2048': {
        weekly: { active: true },
        alerts: { active: false },
      },
    },
  };

  it('detects active city subscriptions', () => {
    expect(hasActiveCitySubscriptions(baseRegistry, 'dubai-AE-25.2048')).toBe(true);
    expect(hasActiveCitySubscriptions(baseRegistry, 'missing')).toBe(false);
  });

  it('returns button labels from state', () => {
    expect(getButtonLabel(getCitySubscriptionState(baseRegistry, 'dubai-AE-25.2048'))).toBe(
      'Forecasts on',
    );
  });

  it('merges subscription responses', () => {
    const next = mergeSubscriptionOnSuccess(baseRegistry, {
      email: 'user@example.com',
      type: 'city_alerts',
      id: 'sub-1',
      unsubscribeToken: 'token-1',
      createdAt: '2026-07-09T00:00:00.000Z',
      alertOnRain: true,
      alertOnStorm: true,
      cityLat: 25.2048,
      cityLon: 55.2708,
    }, 'dubai-AE-25.2048');

    expect(next.cities['dubai-AE-25.2048'].alerts.active).toBe(true);
  });

  it('clears selected subscription types', () => {
    const next = clearCitySubscriptions(baseRegistry, 'dubai-AE-25.2048', ['weekly']);
    expect(next.cities['dubai-AE-25.2048']).toBeUndefined();
  });
});
