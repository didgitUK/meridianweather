import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': ['text-display', 'text-display-sm', 'text-metric', 'text-metric-lg'],
    },
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatAge(ms) {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function buildCityId(name, country, lat) {
  return `${slugify(name)}-${country}-${lat.toFixed(4)}`;
}

export function parseCityId(cityId) {
  const match = cityId.match(/^(.+)-([A-Za-z]{2})-(-?\d+\.\d{4})$/);
  if (!match) {
    return null;
  }

  const [, nameSlug, country, latValue] = match;

  return {
    id: cityId,
    name: nameSlug
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    country: country.toUpperCase(),
    lat: Number(latValue),
    lon: null,
    state: null,
  };
}
