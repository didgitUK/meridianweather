import { Suspense } from 'react';
import BillingSuccessClient from './BillingSuccessClient';
import { BrandLoadingScreen } from '@/features/weather/components/CityDetailLoadingScreen';

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<BrandLoadingScreen stageKey="preparingForecast" />}>
      <BillingSuccessClient />
    </Suspense>
  );
}
