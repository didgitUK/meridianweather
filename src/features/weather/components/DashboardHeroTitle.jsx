import { BRAND } from '@/constants/brand';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function DashboardHeroTitle() {
  return (
    <h1 className={cn(TYPOGRAPHY.display, TYPOGRAPHY.heading, 'tracking-tight text-foreground')}>
      {BRAND.tagline}
    </h1>
  );
}
