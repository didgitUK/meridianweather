import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function FooterAppDownloadCard({
  icon: Icon,
  title,
  subtitle,
  disabled = false,
  onClick,
  className,
}) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'h-full min-h-[5.75rem] w-full flex-col items-start justify-between gap-2 rounded-xl border-[var(--color-header-border)] px-3 py-3 text-left text-[var(--color-header-fg)]',
        disabled
          ? 'bg-transparent opacity-70'
          : 'bg-[rgb(255_255_255/0.06)] hover:bg-[rgb(255_255_255/0.1)]',
        className,
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      <span className="flex min-w-0 flex-col items-start gap-0.5">
        <span className="text-sm font-medium leading-tight">{title}</span>
        <span className="text-xs leading-snug" style={{ color: 'var(--color-header-muted)' }}>
          {subtitle}
        </span>
      </span>
    </Button>
  );
}
