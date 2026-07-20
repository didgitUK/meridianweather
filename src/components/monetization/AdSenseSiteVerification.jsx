import { getAdSenseClientId } from '@/lib/server/adsense';

/**
 * Meta tag backup for AdSense site confirmation.
 * The adsbygoogle.js snippet lives in root layout <head> (required for code-snippet verification).
 */
export function AdSenseSiteVerification() {
  const clientId = getAdSenseClientId();

  if (!clientId) {
    return null;
  }

  return <meta name="google-adsense-account" content={clientId} />;
}
