import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** Condition icons mapped from OpenWeather codes. */
const CONDITION_ICON_NAMES = [
  'clear-day',
  'clear-night',
  'partly-cloudy-day',
  'partly-cloudy-night',
  'cloudy',
  'overcast-day',
  'overcast-night',
  'overcast-day-rain',
  'overcast-night-rain',
  'partly-cloudy-day-rain',
  'partly-cloudy-night-rain',
  'thunderstorms-day',
  'thunderstorms-night',
  'overcast-day-snow',
  'overcast-night-snow',
  'fog-day',
  'fog-night',
];

/** Colored fill icons used for metric / detail tiles. */
const METRIC_ICON_NAMES = [
  'thermometer',
  'thermometer-sun',
  'thermometer-water',
  'thermometer-raindrop',
  'humidity',
  'barometer',
  'uv-index',
  'fog',
  'wind',
  'windsock',
  'raindrop',
  'snowflake',
  'clear-day',
  'starry-night',
  'compass',
  'time-afternoon',
];

const ICON_NAMES = [...new Set([...CONDITION_ICON_NAMES, ...METRIC_ICON_NAMES])];

const sourceDir = path.join(root, 'node_modules/@meteocons/svg-static/fill');
const targetDir = path.join(root, 'public/weather-icons');

if (!fs.existsSync(sourceDir)) {
  console.error('Run npm install first — @meteocons/svg-static is required.');
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });

for (const iconName of ICON_NAMES) {
  const sourcePath = path.join(sourceDir, `${iconName}.svg`);
  const targetPath = path.join(targetDir, `${iconName}.svg`);

  if (!fs.existsSync(sourcePath)) {
    console.error(`Missing source icon: ${iconName}.svg`);
    process.exit(1);
  }

  fs.copyFileSync(sourcePath, targetPath);
}

const attribution = `Meteocons weather icons
Copyright (c) Bas Milius
https://github.com/basmilius/meteocons

MIT License — icons copied from @meteocons/svg-static (fill style).
Includes condition icons for OpenWeather mapping and metric tiles
(humidity, barometer, wind, UV, sunrise/sunset, etc.).
`;

fs.writeFileSync(path.join(targetDir, 'ATTRIBUTION.txt'), attribution);

console.log(`Copied ${ICON_NAMES.length} Meteocons icons to public/weather-icons/`);
