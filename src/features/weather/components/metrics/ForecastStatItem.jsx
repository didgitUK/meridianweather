import { MeteoconIcon } from '@/features/weather/components/MeteoconIcon';

export function ForecastStatItem({ icon: Icon, iconName, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      {iconName ? (
        <MeteoconIcon name={iconName} size={32} className="size-8" alt="" />
      ) : Icon ? (
        <Icon className="size-8 shrink-0 text-muted-foreground/80" aria-hidden />
      ) : null}
      {children}
    </span>
  );
}
