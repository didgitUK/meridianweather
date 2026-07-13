import { cn } from '@/lib/utils';

export function CityDetailOptionsMenuItem({
  icon: Icon,
  label,
  description,
  onClick,
  className,
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        className,
      )}
    >
      {Icon ? <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden /> : null}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium leading-none">{label}</span>
        {description ? (
          <span className="text-xs leading-snug text-muted-foreground">{description}</span>
        ) : null}
      </span>
    </button>
  );
}
