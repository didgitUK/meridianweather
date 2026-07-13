import { cn } from '@/lib/utils';

const TONE_CLASS = {
  default: 'border-border bg-muted/20',
  ok: 'border-border bg-muted/20',
  warning: 'border-amber-500/40 bg-amber-500/10',
  danger: 'border-destructive/40 bg-destructive/10',
};

export function AdminMetricCard({ label, value, hint, tone = 'default', onClick }) {
  const className = cn(
    'rounded-lg border px-3 py-3 text-left transition-colors',
    TONE_CLASS[tone] ?? TONE_CLASS.default,
    onClick
      ? 'cursor-pointer hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      : null,
  );

  const body = (
    <>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-tabular text-lg font-medium leading-none text-foreground">{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}
