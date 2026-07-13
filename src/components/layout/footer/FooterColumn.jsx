import { cn } from '@/lib/utils';

export function FooterColumn({ title, children, className }) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <h2
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--color-header-muted)' }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
