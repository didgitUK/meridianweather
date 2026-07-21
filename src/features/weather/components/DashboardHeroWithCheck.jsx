'use client';

import { DashboardHero } from '@/features/weather/components/DashboardHero';
import { useCheckCityNavigation } from '@/features/cities/hooks/useCheckCityNavigation';

export function DashboardHeroWithCheck() {
  const handleCheckCity = useCheckCityNavigation();

  return <DashboardHero onCheckCity={handleCheckCity} />;
}
