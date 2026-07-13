import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const ICON_NAMES = [
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
`;

fs.writeFileSync(path.join(targetDir, 'ATTRIBUTION.txt'), attribution);

console.log(`Copied ${ICON_NAMES.length} Meteocons icons to public/weather-icons/`);
