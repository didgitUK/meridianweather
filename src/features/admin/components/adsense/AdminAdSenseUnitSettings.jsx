'use client';

import { Input } from '@/components/ui/input';
import { AdminField, AdminPanel } from '@/features/admin/components/AdminPanel';
import { useDebouncedAdminSave } from '@/features/admin/hooks/useDebouncedAdminSave';

export function AdminAdSenseUnitSettings({ settings, ads, onUpdated }) {
  const { save, isSaving, error } = useDebouncedAdminSave(onUpdated);

  if (!settings || !ads) {
    return null;
  }

  return (
    <AdminPanel
      title="Ad unit settings"
      description="Publisher ID and dashboard slot for live ad delivery. Env values are used when these fields are empty."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="AdSense enabled">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.adsenseEnabled}
              onChange={(event) => save({ adsenseEnabled: event.target.checked })}
            />
            Load Google AdSense on the public site
          </label>
        </AdminField>

        <AdminField label="Effective client ID">
          <Input value={ads.effectiveClientId || 'Not configured'} readOnly />
        </AdminField>

        <AdminField label="Publisher client ID (ca-pub-…)">
          <Input
            value={settings.adsenseClientId}
            placeholder={ads.envClientId || 'ca-pub-…'}
            onChange={(event) => save({ adsenseClientId: event.target.value })}
          />
        </AdminField>

        <AdminField label="Dashboard slot ID">
          <Input
            value={settings.adsenseSlotDashboard}
            placeholder={ads.envSlotDashboard || 'Numeric slot ID'}
            onChange={(event) => save({ adsenseSlotDashboard: event.target.value })}
          />
        </AdminField>
      </div>

      {isSaving ? <p className="mt-3 text-xs text-muted-foreground">Saving…</p> : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </AdminPanel>
  );
}
