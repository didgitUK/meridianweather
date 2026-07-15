import { formatConditionLabel, formatTemperature, formatWindDirection } from '@/features/weather/utils/formatWeather';
import { openWeatherIconToMeteocon } from '@/features/weather/utils/weather-icon';
import { escapeHtml } from '@/lib/email-templates/render-email-template';
import { getHeroImageForRegion } from '@/lib/hero-image/get-hero-image-for-region';
import { resolveUnsplashHeroImage } from '@/lib/hero-image/unsplash-resolver';

const DAILY_FORECAST_DAYS = 10;
const DEFAULT_EMAIL_HERO_IMAGE =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&h=400&auto=format&fit=crop&fm=jpg';

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

function dash(value) {
  if (value == null || value === '') return '—';
  return String(value);
}

function formatUnixLocal(unixSeconds, timezoneOffsetSeconds) {
  if (unixSeconds == null) return '—';
  const offsetMs = (timezoneOffsetSeconds ?? 0) * 1000;
  const date = new Date(Number(unixSeconds) * 1000 + offsetMs);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function roundTempNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return String(Math.round(Number(value)));
}

/**
 * Weekday + short date for forecast rows (works with IANA tz or offset-only payloads).
 */
export function formatForecastDayLabel(unixSeconds, timezone = null, timezoneOffsetSeconds = 0) {
  if (unixSeconds == null) return '—';

  if (timezone) {
    return new Date(Number(unixSeconds) * 1000).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: timezone,
    });
  }

  const offsetMs = (timezoneOffsetSeconds ?? 0) * 1000;
  const date = new Date(Number(unixSeconds) * 1000 + offsetMs);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${weekdays[date.getUTCDay()]} ${date.getUTCDate()} ${months[date.getUTCMonth()]}`;
}

/**
 * Absolute icon URL for email clients (must be publicly reachable).
 * Prefers hosted Meteocons under /weather-icons; also exposes OpenWeather CDN.
 */
export function buildWeatherIconUrls(iconCode, appUrl = getAppUrl()) {
  const code = iconCode ? String(iconCode).replace('@2x', '').trim() : '';
  const iconName = openWeatherIconToMeteocon(code || null);
  const base = String(appUrl).replace(/\/$/, '');

  return {
    iconCode: code,
    iconName,
    iconUrl: `${base}/weather-icons/${iconName}.svg`,
    iconUrlPng: code
      ? `https://openweathermap.org/img/wn/${code}@2x.png`
      : `${base}/weather-icons/${iconName}.svg`,
  };
}

/**
 * Prefer JPEG Unsplash delivery for email clients; skip relative/SVG static fallbacks.
 * @param {string | null | undefined} imageUrl
 * @param {string} [appUrl]
 */
export function toEmailHeroImageUrl(imageUrl, appUrl = getAppUrl()) {
  if (!imageUrl) {
    return DEFAULT_EMAIL_HERO_IMAGE;
  }

  const raw = String(imageUrl).trim();
  if (!raw || raw.endsWith('.svg')) {
    return DEFAULT_EMAIL_HERO_IMAGE;
  }

  const absolute = raw.startsWith('http://') || raw.startsWith('https://')
    ? raw
    : `${String(appUrl).replace(/\/$/, '')}${raw.startsWith('/') ? '' : '/'}${raw}`;

  try {
    const url = new URL(absolute);
    if (url.hostname.includes('unsplash.com') || url.hostname.includes('images.unsplash.com')) {
      url.searchParams.set('fm', 'jpg');
      url.searchParams.set('q', '75');
      url.searchParams.set('w', '1200');
      url.searchParams.set('h', '400');
      url.searchParams.set('fit', 'crop');
      url.searchParams.delete('auto');
    }
    return url.toString();
  } catch {
    return DEFAULT_EMAIL_HERO_IMAGE;
  }
}

/**
 * Resolve a location-recognisable hero image for alert emails (reuses homepage Unsplash cache).
 * @param {{ city?: string | null, country?: string | null, lat?: number | null, lon?: number | null }} region
 * @param {{ appUrl?: string, getHeroImage?: typeof getHeroImageForRegion, resolveUnsplash?: typeof resolveUnsplashHeroImage }} [options]
 */
export async function buildEmailHeroImageVars(region, options = {}) {
  const appUrl = options.appUrl ?? getAppUrl();
  const resolveHero = options.getHeroImage ?? getHeroImageForRegion;
  const resolveUnsplash = options.resolveUnsplash ?? resolveUnsplashHeroImage;
  let heroImageUrl = DEFAULT_EMAIL_HERO_IMAGE;
  let heroImageCredit = '';

  try {
    let hero = null;

    if (region?.country) {
      hero = await resolveHero({
        city: region.city ?? null,
        country: region.country,
        state: region.state ?? null,
        lat: region.lat ?? null,
        lon: region.lon ?? null,
        temperature: region.temperature ?? null,
        weatherId: region.weatherId ?? null,
        condition: region.condition ?? null,
        description: region.description ?? null,
        icon: region.icon ?? null,
      });
    } else if (region?.city) {
      // One Call current often omits country; still search Unsplash by city name.
      hero = await resolveUnsplash({
        city: region.city,
        country: null,
        weatherScene: region.weatherScene ?? null,
        temperature: region.temperature ?? null,
        weatherId: region.weatherId ?? null,
      });
    }

    const landscapeUrl = hero?.landscape?.imageUrl ?? hero?.imageUrl ?? null;
    if (landscapeUrl) {
      heroImageUrl = toEmailHeroImageUrl(landscapeUrl, appUrl);
    }
    const photographer = hero?.landscape?.photographer ?? hero?.photographer ?? null;
    if (photographer) {
      heroImageCredit = `Photo: ${photographer}`;
    }
  } catch {
    heroImageUrl = DEFAULT_EMAIL_HERO_IMAGE;
  }

  return {
    logoUrl: `${String(appUrl).replace(/\/$/, '')}/brand/logo-on-dark.png`,
    heroImageUrl,
    heroImageCredit,
  };
}

/**
 * Map daily forecast points into day1…day10 shortcodes + a prebuilt HTML table.
 * @param {object | null | undefined} dailyForecast
 * @param {{ days?: number }} [options]
 */
export function buildDailyForecastEmailVars(dailyForecast, options = {}) {
  const days = options.days ?? DAILY_FORECAST_DAYS;
  const points = Array.isArray(dailyForecast?.points) ? dailyForecast.points.slice(0, days) : [];
  const timezone = dailyForecast?.timezone ?? null;
  const timezoneOffset = dailyForecast?.timezoneOffset ?? 0;
  const vars = {};
  const rows = [];

  for (let index = 0; index < days; index += 1) {
    const dayNumber = index + 1;
    const point = points[index] ?? null;
    const dateLabel = point
      ? formatForecastDayLabel(point.dt, timezone, timezoneOffset)
      : '—';
    const condition = point
      ? formatConditionLabel(point.description || point.condition || point.summary || '—')
      : '—';
    const high = point ? roundTempNumber(point.tempMax ?? point.temp) : '—';
    const low = point ? roundTempNumber(point.tempMin ?? point.temp) : '—';

    vars[`day${dayNumber}Date`] = dateLabel;
    vars[`day${dayNumber}Condition`] = condition;
    vars[`day${dayNumber}High`] = high;
    vars[`day${dayNumber}Low`] = low;

    rows.push(`
             <tr style="border-bottom:1px solid #e5e5e5;">
               <td style="padding:16px 0;font-weight:bold;">${escapeHtml(dateLabel)}</td>
               <td style="padding:16px 0;text-align:center;">${escapeHtml(condition)}</td>
               <td style="padding:16px 0;text-align:right;"><strong>${escapeHtml(high)}°</strong> / ${escapeHtml(low)}°</td>
             </tr>`);
  }

  const dailyForecastHtml = `
<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="border-collapse:collapse;font-size:14px;">
${rows.join('\n')}
</table>`.trim();

  return {
    ...vars,
    dailyForecastHtml,
  };
}

/**
 * Map a normalized current-weather snapshot into email template shortcodes.
 * @param {object|null|undefined} weather
 * @param {{ appUrl?: string }} [options]
 */
export function buildCurrentWeatherEmailVars(weather, options = {}) {
  const appUrl = options.appUrl ?? getAppUrl();
  const icons = buildWeatherIconUrls(weather?.icon, appUrl);
  const windDir = formatWindDirection(weather?.windDeg);

  const temperature = formatTemperature(weather?.temperature);
  const feelsLike = formatTemperature(weather?.feelsLike);
  const description = formatConditionLabel(weather?.description ?? weather?.condition);
  const humidity = weather?.humidity != null ? String(weather.humidity) : '—';
  const pressure = weather?.pressure != null ? String(weather.pressure) : '—';
  const dewPoint = formatTemperature(weather?.dewPoint);
  const uvi = weather?.uvi != null ? String(weather.uvi) : '—';
  const clouds = weather?.clouds != null ? String(weather.clouds) : '—';
  const visibility =
    weather?.visibility != null ? String(Math.round(Number(weather.visibility) / 1000)) : '—';
  const windSpeedKmh = weather?.windSpeedKmh != null ? String(weather.windSpeedKmh) : '—';
  const windGustKmh = weather?.windGustKmh != null ? String(weather.windGustKmh) : '—';
  const windDeg = weather?.windDeg != null ? String(weather.windDeg) : '—';
  const windDirection = windDir ?? '—';
  const rain1h = weather?.rain1h != null ? String(weather.rain1h) : '—';
  const snow1h = weather?.snow1h != null ? String(weather.snow1h) : '—';
  const pop = weather?.pop != null ? String(Math.round(Number(weather.pop) * 100)) : '—';
  const sunrise = formatUnixLocal(weather?.sunrise, weather?.timezoneOffset);
  const sunset = formatUnixLocal(weather?.sunset, weather?.timezoneOffset);
  const lat = weather?.lat != null ? String(weather.lat) : '—';
  const lon = weather?.lon != null ? String(weather.lon) : '—';
  const country = dash(weather?.country);
  const timezone = dash(weather?.timezone);
  const updatedAt =
    weather?.updatedAt != null
      ? new Date(Number(weather.updatedAt) * 1000).toISOString()
      : '—';

  const currentCardHtml = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;color:#111111;">
  <tr>
    <td style="padding:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="72" valign="top" style="padding-right:16px;">
            <img src="${escapeHtml(icons.iconUrlPng)}" width="64" height="64" alt="${escapeHtml(description)}" style="display:block;border:0;" />
          </td>
          <td valign="top">
            <p style="margin:0 0 4px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;color:#666666;">Now</p>
            <p style="margin:0 0 4px;font-size:36px;line-height:1;font-weight:500;">${escapeHtml(temperature)}</p>
            <p style="margin:0;font-size:16px;">${escapeHtml(description)}</p>
            <p style="margin:8px 0 0;font-size:13px;color:#666666;">Feels like ${escapeHtml(feelsLike)}</p>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;border-top:1px solid #e5e5e5;">
        <tr>
          <td style="padding:12px 8px 0 0;font-size:13px;width:33%;">Humidity<br /><strong>${escapeHtml(humidity)}%</strong></td>
          <td style="padding:12px 8px 0;font-size:13px;width:33%;">Wind<br /><strong>${escapeHtml(windSpeedKmh)} km/h ${escapeHtml(windDirection)}</strong></td>
          <td style="padding:12px 0 0 8px;font-size:13px;width:33%;">Pressure<br /><strong>${escapeHtml(pressure)} hPa</strong></td>
        </tr>
        <tr>
          <td style="padding:12px 8px 0 0;font-size:13px;">Clouds<br /><strong>${escapeHtml(clouds)}%</strong></td>
          <td style="padding:12px 8px 0;font-size:13px;">UV<br /><strong>${escapeHtml(uvi)}</strong></td>
          <td style="padding:12px 0 0 8px;font-size:13px;">Visibility<br /><strong>${escapeHtml(visibility)} km</strong></td>
        </tr>
        <tr>
          <td style="padding:12px 8px 0 0;font-size:13px;">Sunrise<br /><strong>${escapeHtml(sunrise)}</strong></td>
          <td style="padding:12px 8px 0;font-size:13px;">Sunset<br /><strong>${escapeHtml(sunset)}</strong></td>
          <td style="padding:12px 0 0 8px;font-size:13px;">Dew point<br /><strong>${escapeHtml(dewPoint)}</strong></td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();

  return {
    temperature,
    temperatureC: weather?.temperature != null ? String(weather.temperature) : '—',
    feelsLike,
    description,
    weatherCondition: formatConditionLabel(weather?.condition),
    humidity,
    pressure,
    dewPoint,
    uvi,
    clouds,
    visibilityKm: visibility,
    windSpeedKmh,
    windGustKmh,
    windDeg,
    windDirection,
    rain1h,
    snow1h,
    pop,
    sunrise,
    sunset,
    lat,
    lon,
    country,
    timezone,
    updatedAt,
    weatherId: weather?.weatherId != null ? String(weather.weatherId) : '—',
    ...icons,
    currentCardHtml,
  };
}

function buildDayVariableNames(days = DAILY_FORECAST_DAYS) {
  const names = [];
  for (let index = 1; index <= days; index += 1) {
    names.push(`day${index}Date`, `day${index}Condition`, `day${index}High`, `day${index}Low`);
  }
  return names;
}

/** Variable names exposed on weather-alert templates (for admin UI + docs). */
export const WEATHER_ALERT_EMAIL_VARIABLES = [
  'cityName',
  'condition',
  'matchLabel',
  'unsubscribeUrl',
  'alertLabel',
  'alertTypeId',
  'alertSource',
  'temperature',
  'temperatureC',
  'feelsLike',
  'description',
  'weatherCondition',
  'humidity',
  'pressure',
  'dewPoint',
  'uvi',
  'clouds',
  'visibilityKm',
  'windSpeedKmh',
  'windGustKmh',
  'windDeg',
  'windDirection',
  'rain1h',
  'snow1h',
  'pop',
  'sunrise',
  'sunset',
  'lat',
  'lon',
  'country',
  'timezone',
  'updatedAt',
  'weatherId',
  'iconCode',
  'iconName',
  'iconUrl',
  'iconUrlPng',
  'currentCardHtml',
  'dailyForecastHtml',
  'logoUrl',
  'heroImageUrl',
  'heroImageCredit',
  ...buildDayVariableNames(),
];

function buildSampleDailyForecast() {
  const start = 1_720_015_000;
  const day = 86_400;
  const conditions = [
    ['Rain', 'Light rain'],
    ['Clouds', 'Partly cloudy'],
    ['Clear', 'Clear sky'],
    ['Clouds', 'Overcast'],
    ['Rain', 'Moderate rain'],
    ['Clear', 'Sunny'],
    ['Clouds', 'Scattered clouds'],
    ['Thunderstorm', 'Thunderstorm'],
    ['Rain', 'Showers'],
    ['Clear', 'Clear sky'],
  ];

  return {
    timezone: 'Europe/London',
    timezoneOffset: 0,
    points: conditions.map(([condition, description], index) => ({
      dt: start + index * day,
      tempMax: 16 + (index % 4),
      tempMin: 9 + (index % 3),
      condition,
      description,
    })),
  };
}

export function buildWeatherAlertPreviewWeatherVars(alertType) {
  const label = alertType?.label ?? 'Weather alert';
  const sampleWeather = {
    temperature: 14,
    feelsLike: 12,
    description: 'Light rain',
    condition: 'Rain',
    icon: '10d',
    weatherId: 500,
    humidity: 82,
    pressure: 1008,
    dewPoint: 11,
    uvi: 2.1,
    clouds: 76,
    visibility: 8000,
    windSpeedKmh: 18.4,
    windGustKmh: 28,
    windDeg: 220,
    rain1h: 1.2,
    snow1h: null,
    sunrise: 1_720_000_000,
    sunset: 1_720_030_000,
    timezoneOffset: 0,
    lat: 53.48,
    lon: -2.24,
    country: 'GB',
    timezone: 'Europe/London',
    updatedAt: 1_720_015_000,
  };

  return {
    cityName: 'Manchester',
    condition: `${label}: sample event`,
    matchLabel: 'sample event',
    unsubscribeUrl: 'https://meridianweather.co.uk/api/unsubscribe?token=preview',
    alertLabel: label,
    alertTypeId: alertType?.id ?? '',
    alertSource: alertType?.source ?? 'openweather',
    logoUrl: 'https://meridianweather.co.uk/brand/logo-on-dark.png',
    heroImageUrl:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&h=400&auto=format&fit=crop&fm=jpg',
    heroImageCredit: 'Photo: preview',
    ...buildCurrentWeatherEmailVars(sampleWeather, {
      appUrl: 'https://meridianweather.co.uk',
    }),
    ...buildDailyForecastEmailVars(buildSampleDailyForecast()),
  };
}
