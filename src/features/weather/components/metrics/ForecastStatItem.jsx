export function ForecastStatItem({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      {Icon ? <Icon className="size-8 shrink-0 text-muted-foreground/80" aria-hidden /> : null}
      {children}
    </span>
  );
}
