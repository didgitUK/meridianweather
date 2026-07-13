import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const NORTH_ENGLAND_SEED_LOCATIONS = [
  { name: 'Carlisle', state: 'Cumbria', country: 'GB', lat: 54.8951, lon: -2.9382 },
  { name: 'Penrith', state: 'Cumbria', country: 'GB', lat: 54.6644, lon: -2.7598 },
  { name: 'Kendal', state: 'Cumbria', country: 'GB', lat: 54.328, lon: -2.746 },
  { name: 'Barrow-in-Furness', state: 'Cumbria', country: 'GB', lat: 54.1109, lon: -3.2276 },
  { name: 'Whitehaven', state: 'Cumbria', country: 'GB', lat: 54.5487, lon: -3.5855 },
  { name: 'Workington', state: 'Cumbria', country: 'GB', lat: 54.6425, lon: -3.5441 },
  { name: 'Cockermouth', state: 'Cumbria', country: 'GB', lat: 54.6633, lon: -3.366 },
  { name: 'Keswick', state: 'Cumbria', country: 'GB', lat: 54.6014, lon: -3.1346 },
  { name: 'Ambleside', state: 'Cumbria', country: 'GB', lat: 54.4325, lon: -2.9618 },
  { name: 'Windermere', state: 'Cumbria', country: 'GB', lat: 54.3809, lon: -2.907 },
  { name: 'Ulverston', state: 'Cumbria', country: 'GB', lat: 54.1959, lon: -3.0973 },
  { name: 'Maryport', state: 'Cumbria', country: 'GB', lat: 54.7143, lon: -3.495 },
  { name: 'Brampton', state: 'Cumbria', country: 'GB', lat: 54.9434, lon: -2.7369 },
  { name: 'Wigton', state: 'Cumbria', country: 'GB', lat: 54.8248, lon: -3.161 },
  { name: 'Silloth', state: 'Cumbria', country: 'GB', lat: 54.8689, lon: -3.3887 },
  { name: 'Millom', state: 'Cumbria', country: 'GB', lat: 54.2107, lon: -3.2719 },
  { name: 'Alston', state: 'Cumbria', country: 'GB', lat: 54.812, lon: -2.439 },
  { name: 'Kirkby Stephen', state: 'Cumbria', country: 'GB', lat: 54.472, lon: -2.348 },
  { name: 'Newcastle upon Tyne', state: 'Tyne and Wear', country: 'GB', lat: 54.9783, lon: -1.6178 },
  { name: 'Sunderland', state: 'Tyne and Wear', country: 'GB', lat: 54.9069, lon: -1.3838 },
  { name: 'Gateshead', state: 'Tyne and Wear', country: 'GB', lat: 54.9526, lon: -1.6034 },
  { name: 'South Shields', state: 'Tyne and Wear', country: 'GB', lat: 54.9981, lon: -1.4328 },
  { name: 'Tynemouth', state: 'Tyne and Wear', country: 'GB', lat: 55.0175, lon: -1.424 },
  { name: 'Washington', state: 'Tyne and Wear', country: 'GB', lat: 54.898, lon: -1.519 },
  { name: 'Durham', state: 'County Durham', country: 'GB', lat: 54.7761, lon: -1.5733 },
  { name: 'Darlington', state: 'County Durham', country: 'GB', lat: 54.527, lon: -1.5526 },
  { name: 'Chester-le-Street', state: 'County Durham', country: 'GB', lat: 54.857, lon: -1.574 },
  { name: 'Barnard Castle', state: 'County Durham', country: 'GB', lat: 54.543, lon: -1.924 },
  { name: 'Consett', state: 'County Durham', country: 'GB', lat: 54.854, lon: -1.831 },
  { name: 'Bishop Auckland', state: 'County Durham', country: 'GB', lat: 54.657, lon: -1.676 },
  { name: 'Middlesbrough', state: 'North Yorkshire', country: 'GB', lat: 54.5742, lon: -1.235 },
  { name: 'Stockton-on-Tees', state: 'County Durham', country: 'GB', lat: 54.57, lon: -1.318 },
  { name: 'Hartlepool', state: 'County Durham', country: 'GB', lat: 54.6861, lon: -1.2125 },
  { name: 'Redcar', state: 'North Yorkshire', country: 'GB', lat: 54.618, lon: -1.069 },
  { name: 'Yarm', state: 'North Yorkshire', country: 'GB', lat: 54.505, lon: -1.354 },
  { name: 'Hexham', state: 'Northumberland', country: 'GB', lat: 54.9716, lon: -2.101 },
  { name: 'Morpeth', state: 'Northumberland', country: 'GB', lat: 55.168, lon: -1.686 },
  { name: 'Alnwick', state: 'Northumberland', country: 'GB', lat: 55.4127, lon: -1.706 },
  { name: 'Blyth', state: 'Northumberland', country: 'GB', lat: 55.61, lon: -1.515 },
  { name: 'Ashington', state: 'Northumberland', country: 'GB', lat: 55.181, lon: -1.568 },
  { name: 'Berwick-upon-Tweed', state: 'Northumberland', country: 'GB', lat: 55.768, lon: -2.007 },
  { name: 'Seaham', state: 'County Durham', country: 'GB', lat: 54.84, lon: -1.34 },
  { name: 'Seahouses', state: 'Northumberland', country: 'GB', lat: 55.431, lon: -1.647 },
];

const CURRENT_TTL_MS = 60 * 60 * 1000;
const STALE_TTL_MS = 2 * 60 * 60 * 1000;

function loadEnvFile(filename) {
  const envPath = path.join(root, filename);

  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');

    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function toKmh(speedMs) {
  if (speedMs == null) return null;
  return Math.round(speedMs * 3.6 * 10) / 10;
}

function buildSnapshotKey(lat, lon, scope) {
  return `${Number(lat).toFixed(4)},${Number(lon).toFixed(4)},${scope}`;
}

function normalizeCurrentFromOneCall(data, lat, lon, location) {
  const point = data?.data?.[0] ?? {};
  const weather = point.weather?.[0] ?? {};

  return {
    scope: 'current',
    lat,
    lon,
    timezone: data.timezone,
    temperature: point.temp,
    feelsLike: point.feels_like,
    description: capitalize(weather.description),
    condition: weather.main,
    icon: weather.icon,
    humidity: point.humidity,
    pressure: point.pressure,
    dewPoint: point.dew_point,
    uvi: point.uvi,
    clouds: point.clouds,
    visibility: point.visibility,
    windSpeedKmh: toKmh(point.wind_speed),
    windGustKmh: toKmh(point.wind_gust),
    windDeg: point.wind_deg,
    sunrise: point.sunrise,
    sunset: point.sunset,
    alertIds: point.alerts ?? [],
    updatedAt: point.dt,
    city: location.name,
    country: location.country,
    state: location.state,
    source: 'onecall_current',
  };
}

function normalizeCurrentFromLegacy(data, lat, lon, location) {
  const weather = data.weather?.[0] ?? {};

  return {
    scope: 'current',
    lat,
    lon,
    timezone: null,
    temperature: data.main?.temp,
    feelsLike: data.main?.feels_like,
    description: capitalize(weather.description),
    condition: weather.main,
    icon: weather.icon,
    humidity: data.main?.humidity,
    pressure: data.main?.pressure,
    dewPoint: null,
    uvi: null,
    clouds: data.clouds?.all,
    visibility: data.visibility,
    windSpeedKmh: toKmh(data.wind?.speed),
    windGustKmh: toKmh(data.wind?.gust),
    windDeg: data.wind?.deg,
    sunrise: data.sys?.sunrise,
    sunset: data.sys?.sunset,
    alertIds: [],
    updatedAt: data.dt,
    city: location.name,
    country: location.country,
    state: location.state,
    source: 'weather_2_5',
  };
}

function openDatabase() {
  const dbPath = process.env.DATABASE_PATH || './data/meridian.db';
  const absolutePath = path.isAbsolute(dbPath) ? dbPath : path.join(root, dbPath);

  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });

  const db = new Database(absolutePath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS weather_snapshots (
      id TEXT PRIMARY KEY,
      lat REAL,
      lon REAL,
      scope TEXT NOT NULL,
      cache_key TEXT NOT NULL UNIQUE,
      payload_json TEXT NOT NULL,
      fetched_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      stale_until TEXT NOT NULL,
      source TEXT NOT NULL
    );
  `);

  return db;
}

function writeSnapshot(db, { lat, lon, scope, cacheKey, payload, fetchedAt, source }) {
  db.prepare(
    `INSERT INTO weather_snapshots (id, lat, lon, scope, cache_key, payload_json, fetched_at, expires_at, stale_until, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(cache_key) DO UPDATE SET
       payload_json = excluded.payload_json,
       fetched_at = excluded.fetched_at,
       expires_at = excluded.expires_at,
       stale_until = excluded.stale_until,
       source = excluded.source`,
  ).run(
    uuidv4(),
    lat,
    lon,
    scope,
    cacheKey,
    JSON.stringify(payload),
    fetchedAt.toISOString(),
    new Date(fetchedAt.getTime() + CURRENT_TTL_MS).toISOString(),
    new Date(fetchedAt.getTime() + STALE_TTL_MS).toISOString(),
    source,
  );
}

async function fetchCurrentWeather(apiKey, location) {
  const { lat, lon } = location;
  const oneCallUrl = `https://api.openweathermap.org/data/4.0/onecall/current?lat=${lat}&lon=${lon}&units=metric&lang=en&appid=${apiKey}`;

  const oneCallResponse = await fetch(oneCallUrl);

  if (oneCallResponse.ok) {
    const data = await oneCallResponse.json();
    return {
      payload: normalizeCurrentFromOneCall(data, lat, lon, location),
      source: 'onecall_current',
    };
  }

  const legacyUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=en&appid=${apiKey}`;
  const legacyResponse = await fetch(legacyUrl);

  if (!legacyResponse.ok) {
    throw new Error(`OpenWeather returned ${legacyResponse.status}`);
  }

  const data = await legacyResponse.json();

  return {
    payload: normalizeCurrentFromLegacy(data, lat, lon, location),
    source: 'weather_2_5',
  };
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

loadEnvFile('.env.local');
loadEnvFile('.env');

async function main() {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.error('OPENWEATHER_API_KEY is required in .env.local');
    process.exit(1);
  }

  const db = openDatabase();
  const locations = NORTH_ENGLAND_SEED_LOCATIONS;
  let seeded = 0;
  let failed = 0;

  console.log(`Seeding ${locations.length} North of England weather checks…`);

  for (let index = 0; index < locations.length; index += 1) {
    const location = locations[index];

    try {
      const { payload, source } = await fetchCurrentWeather(apiKey, location);
      const minutesAgo = (locations.length - index - 1) * 4;
      const fetchedAt = new Date(Date.now() - minutesAgo * 60 * 1000);
      const cacheKey = buildSnapshotKey(location.lat, location.lon, 'current');

      writeSnapshot(db, {
        lat: location.lat,
        lon: location.lon,
        scope: 'current',
        cacheKey,
        payload,
        fetchedAt,
        source,
      });

      seeded += 1;
      console.log(
        `[${index + 1}/${locations.length}] ${location.name}: ${payload.temperature}°C — ${payload.description}`,
      );
    } catch (error) {
      failed += 1;
      console.error(`[${index + 1}/${locations.length}] ${location.name}: ${error.message}`);
    }

    if (index < locations.length - 1) {
      await sleep(1100);
    }
  }

  db.close();
  console.log(`\nDone. Seeded ${seeded} checks, ${failed} failed.`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main();
