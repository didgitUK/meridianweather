import { usesEnglishContentPack } from '@/content/locale-content';
import { LEGAL_POLICIES_I18N as de } from './de';
import { LEGAL_POLICIES_I18N as fr } from './fr';
import { LEGAL_POLICIES_I18N as es } from './es';
import { LEGAL_POLICIES_I18N as ja } from './ja';
import { LEGAL_POLICIES_I18N as ar } from './ar';

export const legalPoliciesByLocale = { de, fr, es, ja, ar };

export function getLocalizedLegalPolicies(locale) {
  if (usesEnglishContentPack(locale)) return null;
  return legalPoliciesByLocale[locale] ?? null;
}

export function getLocalizedLegalPolicy(locale, slug) {
  const pack = getLocalizedLegalPolicies(locale);
  if (!pack) return null;
  return pack.find((p) => p.slug === slug) ?? null;
}
