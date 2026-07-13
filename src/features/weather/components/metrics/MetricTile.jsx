import { cn } from '@/lib/utils';
import { MetricTrendIndicator } from '@/features/weather/components/metrics/MetricTrendIndicator';

export function MetricTile({ icon: Icon, label, value, trend, className }) {
  return (
    <div className={cn('rounded-lg border bg-muted/30 px-2.5 py-2 sm:px-3', className)}>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? <Icon className="size-7 shrink-0" aria-hidden /> : null}
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="font-tabular text-base font-semibold leading-tight sm:text-lg">{value}</span>
          </div>
        </div>
        <MetricTrendIndicator trend={trend} className="mt-0.5" />
      </div>
    </div>
  );
}
