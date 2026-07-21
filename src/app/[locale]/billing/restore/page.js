import { Suspense } from 'react';
import BillingRestoreClient from './BillingRestoreClient';
import { BrandLoadingScreen } from '@/features/weather/components/CityDetailLoadingScreen';

export default function BillingRestorePage() {
  return (
    <Suspense fallback={<BrandLoadingScreen stageKey="loadingLocation" />}>
      <BillingRestoreClient />
    </Suspense>
  );
}
