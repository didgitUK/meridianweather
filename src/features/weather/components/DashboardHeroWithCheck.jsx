'use client';

import { DashboardHero } from '@/features/weather/components/DashboardHero';
import { useDashboardHeroImage } from '@/features/weather/components/DashboardHeroSection';
import { useCheckCityNavigation } from '@/features/cities/hooks/useCheckCityNavigation';

export function DashboardHeroWithCheck({ heroImage = null }) {
  const handleCheckCity = useCheckCityNavigation();
  const liveHeroImage = useDashboardHeroImage();

  return (
    <DashboardHero
      onCheckCity={handleCheckCity}
      heroImage={liveHeroImage ?? heroImage}
    />
  );
}
