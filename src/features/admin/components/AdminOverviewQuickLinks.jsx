import { ADMIN_NAV_GROUPS } from '@/constants/admin';
import { AdminPanel } from '@/features/admin/components/AdminPanel';

export function AdminOverviewQuickLinks({ onSectionChange }) {
  const groups = ADMIN_NAV_GROUPS.filter((group) => group.id !== 'home');

  return (
    <AdminPanel title="Sections" description="Jump to a settings area.">
      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.id}>
            {group.label ? (
              <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {group.label}
              </p>
            ) : null}
            <ul className="grid gap-2 sm:grid-cols-2">
              {group.items.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => onSectionChange(section.id)}
                    className="flex w-full flex-col gap-0.5 rounded-lg border border-border bg-background px-3 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="text-sm font-medium text-foreground">{section.label}</span>
                    <span className="text-xs text-muted-foreground">{section.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}
