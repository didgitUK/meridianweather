import { BRAND } from '@/constants/brand';

/**
 * Absolute logo + app URL for every transactional email.
 * @param {{ appUrl?: string }} [options]
 */
export function buildEmailBrandVars(options = {}) {
  const raw = options.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const appUrl = String(raw).replace(/\/$/, '');

  return {
    appUrl,
    logoUrl: `${appUrl}/brand/logo-on-dark.png`,
    brandName: BRAND.name,
    brandDomain: BRAND.domain,
    brandTagline: BRAND.tagline,
  };
}
