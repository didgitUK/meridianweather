'use client';

import { Input } from '@/components/ui/input';
import { AdminField, AdminPanel } from '@/features/admin/components/AdminPanel';
import { useDebouncedAdminSave } from '@/features/admin/hooks/useDebouncedAdminSave';

export function AdminPlatformSettings({ settings, onUpdated }) {
  const { save, isSaving, error } = useDebouncedAdminSave(onUpdated);

  if (!settings) {
    return null;
  }

  return (
    <AdminPanel title="Platform limits" description="Controls applied across the public dashboard.">
      <AdminField label="Max saved locations per device">
        <Input
          type="number"
          min={1}
          max={50}
          value={settings.maxSavedCities}
          onChange={(event) => save({ maxSavedCities: Number(event.target.value) })}
        />
      </AdminField>

      {isSaving ? <p className="mt-3 text-xs text-muted-foreground">Saving…</p> : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </AdminPanel>
  );
}
