import { SPACING } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function PageSection({ children, tone: _tone = 'default', className, innerClassName }) {
  return (
    <section
      className={cn(
        'w-full border-b border-border/60 last:border-b-0 bg-background',
        className,
      )}
    >
      <div className={cn('mx-auto w-full max-w-6xl', SPACING.pageX, SPACING.sectionY, innerClassName)}>
        {children}
      </div>
    </section>
  );
}
