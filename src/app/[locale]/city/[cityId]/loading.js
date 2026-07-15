import { BrandLoadingScreen } from '@/features/weather/components/CityDetailLoadingScreen';

export default function CityLoading() {
  // Fixed stage — soft-progress must not cycle through "Checking alerts…" while RSC loads.
  return <BrandLoadingScreen stageKey="loadingLocation" />;
}
