export function AdminSidebarNavGroup({ label, children }) {
  if (!label) {
    return <div className="shrink-0">{children}</div>;
  }

  return (
    <div className="shrink-0">
      <p className="hidden px-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase lg:block">
        {label}
      </p>
      {children}
    </div>
  );
}
