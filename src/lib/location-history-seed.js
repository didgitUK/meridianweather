import { getDb } from '@/lib/db';
import { recordForecastArchive, recordWeatherObservation } from '@/lib/weather-history-repo';

function roundCoord(value) {
  return Number(Number(value).toFixed(4));
}

function seasonalTemperature(lat, dayOfYear) {
  const latitudeFactor = Math.max(0.4, 1 - Math.abs(lat) / 90);
  const seasonalSwing = 11 * latitudeFactor;
  const baseline = 11 + (45 - Math.abs(lat)) * 0.12;
  const radians = ((dayOfYear - 80) / 365) * Math.PI * 2;

  return baseline + Math.sin(radians) * seasonalSwing;
}

function dayOfYear(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

function buildObservationPayload(date, lat, temperature) {
  const timestamp = Math.floor(date.getTime() / 1000);

  return {
    scope: 'current',
    updatedAt: timestamp,
    temperature: roundCoord(temperature),
    humidity: Math.round(52 + Math.sin(timestamp / 86400) * 12 + lat * 0.05),
    pressure: Math.round(1010 + Math.sin(timestamp / 120000) * 8),
    windSpeedKmh: roundCoord(8 + Math.abs(Math.sin(timestamp / 50000)) * 12),
    description: 'Seeded archive sample',
    condition: 'Seeded archive sample',
    source: 'demo_seed',
  };
}

export function seedDemoLocationHistory(lat, lon, { days = 420 } = {}) {
  const roundedLat = roundCoord(lat);
  const roundedLon = roundCoord(lon);
  const now = new Date();
  let observationCount = 0;

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
    const temp = seasonalTemperature(roundedLat, dayOfYear(date)) + (Math.random() - 0.5) * 2.5;
    const payload = buildObservationPayload(date, roundedLat, temp);

    recordWeatherObservation(roundedLat, roundedLon, payload, date.toISOString());
    observationCount += 1;
  }

  const issuedAt = now.toISOString();
  const dailyPoints = [];

  for (let offset = 0; offset < 14; offset += 1) {
    const date = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    dailyPoints.push({
      dt: Math.floor(date.getTime() / 1000),
      temp: roundCoord(seasonalTemperature(roundedLat, dayOfYear(date))),
      tempMin: roundCoord(seasonalTemperature(roundedLat, dayOfYear(date)) - 3),
      tempMax: roundCoord(seasonalTemperature(roundedLat, dayOfYear(date)) + 4),
      humidity: 58,
      pop: 0.12,
      description: 'Seeded daily outlook',
    });
  }

  recordForecastArchive(
    roundedLat,
    roundedLon,
    'daily',
    { points: dailyPoints },
    issuedAt,
  );

  const archiveCount = getDb()
    .prepare('SELECT COUNT(*) AS count FROM weather_forecast_archive WHERE lat = ? AND lon = ?')
    .get(roundedLat, roundedLon)?.count ?? 0;

  return {
    observationCount,
    archiveCount,
    seededDays: days,
  };
}

export function getForecastArchiveCount(lat, lon) {
  const roundedLat = roundCoord(lat);
  const roundedLon = roundCoord(lon);

  return (
    getDb()
      .prepare('SELECT COUNT(*) AS count FROM weather_forecast_archive WHERE lat = ? AND lon = ?')
      .get(roundedLat, roundedLon)?.count ?? 0
  );
}
