'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import { useConsent } from '@/providers/ConsentProvider';

export function AnalyticsProvider() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const { consent } = useConsent();

  if (!measurementId || !consent.analytics) {
    return null;
  }

  return <GoogleAnalytics gaId={measurementId} />;
}
