import { DashboardHeroBackdrop, DashboardHeroAttribution } from '@/features/weather/components/DashboardHeroBackdrop';
import { SPACING } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';
import '@/features/weather/components/dashboard-hero.css';

export function DashboardHeroSection({ children, heroImage = null }) {
  const hasPhoto = Boolean(heroImage?.landscape?.imageUrl || heroImage?.portrait?.imageUrl);

  return (
    <section
      className={cn(
        'dashboard-hero relative w-full overflow-hidden border-b border-border/60 bg-background',
        hasPhoto && 'dashboard-hero--has-photo',
      )}
    >
      <DashboardHeroBackdrop heroImage={heroImage} />
      <div className={cn('relative mx-auto flex min-h-[22rem] w-full max-w-6xl flex-col justify-center py-10 sm:min-h-[28rem] sm:py-16 md:min-h-[32rem] md:py-20 lg:min-h-[36rem] lg:py-24', SPACING.pageX)}>
        {children}
        <DashboardHeroAttribution heroImage={heroImage} />
      </div>
    </section>
  );
}
