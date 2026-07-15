'use client';

import { CityDetailHero } from '@/features/weather/components/CityDetailHero';

export function CityDetailTodayPanel({
  current,
  meta,
  hourlyPoints,
  todayDay,
  cityName = null,
}) {
  return (
    <div className="flex flex-col gap-6">
      <CityDetailHero
        current={current}
        meta={meta}
        hourlyPoints={hourlyPoints}
        todayDay={todayDay}
        cityName={cityName}
      />
    </div>
  );
}
