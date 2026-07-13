import { AdminOverviewQuickLinks } from '@/features/admin/components/AdminOverviewQuickLinks';
import { AdminOverviewStatusGrid } from '@/features/admin/components/AdminOverviewStatusGrid';

export function AdminOverviewPanel({
  usage,
  settings,
  ads,
  emailConnectors,
  inaccurateReports,
  locations,
  onSectionChange,
  onRefresh,
}) {
  return (
    <div className="flex flex-col gap-6">
      <AdminOverviewStatusGrid
        usage={usage}
        settings={settings}
        ads={ads}
        emailConnectors={emailConnectors}
        inaccurateReports={inaccurateReports}
        locations={locations}
        onSectionChange={onSectionChange}
      />

      <AdminOverviewQuickLinks onSectionChange={onSectionChange} />

      <button
        type="button"
        className="self-start text-sm text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onRefresh}
      >
        Refresh dashboard
      </button>
    </div>
  );
}
