import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendWeatherAlertEmail = vi.fn();
const getLastSendCondition = vi.fn();
const logSubscriptionSend = vi.fn();
const listActiveSubscriptions = vi.fn();
const fetchWeatherForScope = vi.fn();
const evaluateOpenWeatherAlertMatches = vi.fn();
const evaluateOfficialAlertMatches = vi.fn();
const mergeAlertMatches = vi.fn();

vi.mock('@/lib/email', () => ({
  sendWeatherAlertEmail: (...args) => sendWeatherAlertEmail(...args),
}));

vi.mock('@/lib/db/repositories/subscriptions', () => ({
  listActiveSubscriptions: (...args) => listActiveSubscriptions(...args),
  getLastSendCondition: (...args) => getLastSendCondition(...args),
  logSubscriptionSend: (...args) => logSubscriptionSend(...args),
}));

vi.mock('@/lib/platform-settings', () => ({
  getPlatformSettings: () => ({
    openMeteoAlertsEnabled: false,
    nwsAlertsEnabled: false,
    windAlertThresholdMs: 15,
  }),
}));

vi.mock('@/lib/server/cron-auth', () => ({
  isCronRequestAuthorized: () => true,
}));

vi.mock('@/lib/weather-fetch-orchestrator', () => ({
  fetchWeatherForScope: (...args) => fetchWeatherForScope(...args),
}));

vi.mock('@/lib/alerts/fetch-open-meteo-warnings', () => ({
  fetchOpenMeteoWarnings: vi.fn(async () => []),
}));

vi.mock('@/lib/alerts/fetch-nws-alerts', () => ({
  fetchNwsActiveAlerts: vi.fn(async () => []),
}));

vi.mock('@/lib/alerts/evaluate-alert-matches', () => ({
  evaluateOpenWeatherAlertMatches: (...args) => evaluateOpenWeatherAlertMatches(...args),
  evaluateOfficialAlertMatches: (...args) => evaluateOfficialAlertMatches(...args),
  mergeAlertMatches: (...args) => mergeAlertMatches(...args),
}));

describe('GET /api/cron/weather-alerts send logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    getLastSendCondition.mockReturnValue(null);
    listActiveSubscriptions.mockReturnValue([
      {
        id: 'sub-1',
        type: 'city_alerts',
        email: 'a@example.com',
        cityName: 'London',
        cityLat: 51.5,
        cityLon: -0.1,
        unsubscribeToken: 'tok',
        alertPrefs: { extreme_heat: true },
      },
    ]);
    fetchWeatherForScope.mockResolvedValue({ data: { temperature: 32 } });
    evaluateOpenWeatherAlertMatches.mockReturnValue({});
    evaluateOfficialAlertMatches.mockReturnValue({});
    mergeAlertMatches.mockReturnValue({
      extreme_heat: { active: true, label: 'Hot: 32C' },
    });
  });

  it('does not log a send when the email provider returns not sent', async () => {
    sendWeatherAlertEmail.mockResolvedValue({ sent: false, reason: 'email_not_configured' });
    const { GET } = await import('./route.js');
    const response = await GET(new Request('http://localhost/api/cron/weather-alerts'));
    const body = await response.json();

    expect(sendWeatherAlertEmail).toHaveBeenCalled();
    expect(logSubscriptionSend).not.toHaveBeenCalled();
    expect(body.alertsSent).toBe(0);
  });

  it('logs a send only after email reports sent:true', async () => {
    sendWeatherAlertEmail.mockResolvedValue({ sent: true });
    const { GET } = await import('./route.js');
    const response = await GET(new Request('http://localhost/api/cron/weather-alerts'));
    const body = await response.json();

    expect(logSubscriptionSend).toHaveBeenCalledTimes(1);
    expect(logSubscriptionSend.mock.invocationCallOrder[0]).toBeGreaterThan(
      sendWeatherAlertEmail.mock.invocationCallOrder[0],
    );
    expect(body.alertsSent).toBe(1);
  });
});
