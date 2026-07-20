import { getAdSenseClientId } from '@/lib/server/adsense';

/**
 * Always-on meta for AdSense site confirmation (crawlers do not run consent UI).
 * Live adsbygoogle.js still loads only after advertising consent.
 */
export function AdSenseSiteVerification() {
  const clientId = getAdSenseClientId();

  if (!clientId) {
    return null;
  }

  return <meta name="google-adsense-account" content={clientId} />;
}
