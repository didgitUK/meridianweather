import { PageSection } from '@/components/layout/PageSection';
import { WeatherCardSkeleton } from '@/features/weather/components/WeatherCardSkeleton';

export default function CityLoading() {
  return (
    <PageSection>
      <div className="flex flex-col gap-4">
        <WeatherCardSkeleton />
        <WeatherCardSkeleton />
      </div>
    </PageSection>
  );
}
