import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { METRIC_TREND } from '@/features/weather/utils/metric-trend';
import { cn } from '@/lib/utils';

const TREND_CONFIG = {
  [METRIC_TREND.UP]: {
    Icon: ArrowUp,
    className: 'text-emerald-600 dark:text-emerald-400',
    label: 'Trending up',
  },
  [METRIC_TREND.DOWN]: {
    Icon: ArrowDown,
    className: 'text-red-600 dark:text-red-400',
    label: 'Trending down',
  },
  [METRIC_TREND.FLAT]: {
    Icon: Minus,
    className: 'text-muted-foreground',
    label: 'Stable',
  },
};

export function MetricTrendIndicator({ trend, className }) {
  const config = trend ? TREND_CONFIG[trend] : null;

  if (!config) {
    return null;
  }

  const { Icon, className: iconClassName, label } = config;

  return (
    <Icon
      className={cn('size-4 shrink-0', iconClassName, className)}
      aria-label={label}
      role="img"
    />
  );
}
