import { describe, expect, it, vi } from 'vitest';
import {
  WEATHER_ALERT_EMAIL_VARIABLES,
  buildCurrentWeatherEmailVars,
  buildDailyForecastEmailVars,
  buildEmailHeroImageVars,
  buildWeatherIconUrls,
  formatForecastDayLabel,
  toEmailHeroImageUrl,
} from '@/lib/email-templates/build-weather-email-vars';

describe('buildCurrentWeatherEmailVars', () => {
  it('exposes formatted current fields and icon urls', () => {
    const vars = buildCurrentWeatherEmailVars(
      {
        temperature: 14.4,
        feelsLike: 12.1,
        description: 'light rain',
        condition: 'Rain',
        icon: '10d',
        humidity: 82,
        windSpeedKmh: 18.4,
        windDeg: 220,
        pressure: 1008,
        visibility: 8000,
      },
      { appUrl: 'https://example.test' },
    );

    expect(vars.temperature).toMatch(/^14°/);
    expect(vars.description).toBe('Light rain');
    expect(vars.windDirection).toBe('SW');
    expect(vars.visibilityKm).toBe('8');
    expect(vars.iconName).toBe('partly-cloudy-day-rain');
    expect(vars.iconUrl).toBe('https://example.test/weather-icons/partly-cloudy-day-rain.svg');
    expect(vars.iconUrlPng).toContain('10d@2x.png');
    expect(vars.currentCardHtml).toContain('14°');
    expect(vars.currentCardHtml).toContain('Humidity');
  });

  it('lists every shortcode documented for alert templates', () => {
    expect(WEATHER_ALERT_EMAIL_VARIABLES).toContain('currentCardHtml');
    expect(WEATHER_ALERT_EMAIL_VARIABLES).toContain('dailyForecastHtml');
    expect(WEATHER_ALERT_EMAIL_VARIABLES).toContain('day1Date');
    expect(WEATHER_ALERT_EMAIL_VARIABLES).toContain('day10High');
    expect(WEATHER_ALERT_EMAIL_VARIABLES).toContain('heroImageUrl');
    expect(WEATHER_ALERT_EMAIL_VARIABLES).toContain('logoUrl');
    expect(WEATHER_ALERT_EMAIL_VARIABLES).toContain('iconUrlPng');
    expect(WEATHER_ALERT_EMAIL_VARIABLES).toContain('matchLabel');
  });
});

describe('buildDailyForecastEmailVars', () => {
  it('fills day1–day10 tokens and dailyForecastHtml', () => {
    const vars = buildDailyForecastEmailVars({
      timezone: 'Europe/London',
      timezoneOffset: 0,
      points: [
        { dt: 1_720_015_000, tempMax: 16.4, tempMin: 9.2, description: 'light rain', condition: 'Rain' },
        { dt: 1_720_101_400, tempMax: 18, tempMin: 11, description: 'clear sky', condition: 'Clear' },
      ],
    });

    expect(vars.day1High).toBe('16');
    expect(vars.day1Low).toBe('9');
    expect(vars.day1Condition).toBe('Light rain');
    expect(vars.day1Date).toMatch(/^[A-Z][a-z]{2} /);
    expect(vars.day2Condition).toBe('Clear sky');
    expect(vars.day3Date).toBe('—');
    expect(vars.day10High).toBe('—');
    expect(vars.dailyForecastHtml).toContain('Light rain');
    expect(vars.dailyForecastHtml).toContain('16°');
  });
});

describe('formatForecastDayLabel', () => {
  it('formats with timezone offset when IANA zone is missing', () => {
    const label = formatForecastDayLabel(1_720_015_000, null, 0);
    expect(label).toMatch(/^[A-Z][a-z]{2} \d{1,2} [A-Z][a-z]{2}$/);
  });
});

describe('toEmailHeroImageUrl', () => {
  it('forces jpg crop params for unsplash urls', () => {
    const url = toEmailHeroImageUrl(
      'https://images.unsplash.com/photo-1?fm=webp&w=2400',
      'https://example.test',
    );
    expect(url).toContain('fm=jpg');
    expect(url).toContain('w=1200');
  });

  it('falls back when given svg or empty', () => {
    expect(toEmailHeroImageUrl('/hero/default-landscape.svg')).toContain('unsplash.com');
    expect(toEmailHeroImageUrl(null)).toContain('unsplash.com');
  });
});

describe('buildEmailHeroImageVars', () => {
  it('uses landscape image from hero resolver', async () => {
    const vars = await buildEmailHeroImageVars(
      { city: 'Manchester', country: 'GB', lat: 53.48, lon: -2.24 },
      {
        appUrl: 'https://example.test',
        getHeroImage: vi.fn(async () => ({
          landscape: {
            imageUrl: 'https://images.unsplash.com/photo-manchester?fm=webp',
            photographer: 'Alex',
          },
          photographer: 'Alex',
        })),
      },
    );

    expect(vars.logoUrl).toBe('https://example.test/brand/logo-on-dark.png');
    expect(vars.heroImageUrl).toContain('photo-manchester');
    expect(vars.heroImageUrl).toContain('fm=jpg');
    expect(vars.heroImageCredit).toBe('Photo: Alex');
  });
});

describe('buildWeatherIconUrls', () => {
  it('falls back to cloudy when icon missing', () => {
    const icons = buildWeatherIconUrls(null, 'https://example.test');
    expect(icons.iconName).toBe('cloudy');
    expect(icons.iconUrl).toContain('/weather-icons/cloudy.svg');
  });
});
