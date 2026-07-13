import { PageSection } from '@/components/layout/PageSection';
import { WeatherCardSkeleton } from '@/features/weather/components/WeatherCardSkeleton';

export default function LocaleLoading() {
  return (
    <PageSection>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <WeatherCardSkeleton />
        <WeatherCardSkeleton />
        <WeatherCardSkeleton />
      </div>
    </PageSection>
  );
}
