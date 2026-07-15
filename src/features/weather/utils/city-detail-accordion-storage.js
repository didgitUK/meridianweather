import {
  CITY_DETAIL_ACCORDION_CONDITIONS,
} from '@/constants/city-detail';

export const CITY_DETAIL_ACCORDION_SECTIONS = [
  CITY_DETAIL_ACCORDION_CONDITIONS,
];

export function parseCityDetailAccordion(raw) {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value) => CITY_DETAIL_ACCORDION_SECTIONS.includes(value));
  } catch {
    return [];
  }
}

export function serializeCityDetailAccordion(openSections) {
  const normalized = openSections.filter((value) => CITY_DETAIL_ACCORDION_SECTIONS.includes(value));

  return JSON.stringify(normalized);
}
