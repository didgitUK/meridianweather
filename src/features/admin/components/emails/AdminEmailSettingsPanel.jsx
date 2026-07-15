'use client';

import { Button } from '@/components/ui/button';
import {
  WEEKLY_DIGEST_DAY_OPTIONS,
  WEEKLY_DIGEST_FREQUENCY_OPTIONS,
  ADMIN_SECTION_IDS,
} from '@/constants/admin';
import { EMAIL_PROVIDER_OPTIONS, EMAIL_PROVIDERS } from '@/constants/email-providers';
import { AdminField, AdminPanel } from '@/features/admin/components/AdminPanel';
import { useDebouncedAdminSave } from '@/features/admin/hooks/useDebouncedAdminSave';

export function AdminEmailSettingsPanel({ settings, onUpdated, onSectionChange }) {
  const { save, isSaving, error } = useDebouncedAdminSave(onUpdated);

  if (!settings) {
    return null;
  }

  const provider = settings.emailProvider ?? EMAIL_PROVIDERS.none;
  const providerLabel =
    EMAIL_PROVIDER_OPTIONS.find((option) => option.id === provider)?.label ?? provider;

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <AdminPanel
        title="Digest defaults"
        description="Defaults for new weekly digest subscriptions. Outbound cadence still depends on your external cron calling /api/cron/weekly-digests."
      >
        <div className="grid gap-4">
          <AdminField
            label="Default digest frequency"
            hint="Stored for new weekly subscriptions. Public Subscribe UI currently offers weekly until a product change."
          >
            <select
              value={settings.weeklyDigestFrequencyDefault ?? 'weekly'}
              onChange={(event) => save({ weeklyDigestFrequencyDefault: event.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {WEEKLY_DIGEST_FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField
            label="Preferred digest day"
            hint="Informational preference for when weekly digests should run. Schedule the cron to match."
          >
            <select
              value={Number(settings.weeklyDigestDayOfWeek ?? 1)}
              onChange={(event) => save({ weeklyDigestDayOfWeek: Number(event.target.value) })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {WEEKLY_DIGEST_DAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </AdminField>

          <p className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Cron must call <span className="font-mono">/api/cron/weekly-digests</span> (with your cron
            secret). Meridian does not schedule digest sends by itself.
          </p>
        </div>

        {isSaving ? <p className="mt-3 text-xs text-muted-foreground">Saving…</p> : null}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </AdminPanel>

      <AdminPanel
        title="Active email connector"
        description="Credentials live under Connectors → Email. Alert feed toggles stay under Connectors → Alert feeds."
      >
        <p className="text-sm text-foreground">
          {provider === 'none' ? 'No active connector.' : `Active: ${providerLabel}`}
        </p>
        {typeof onSectionChange === 'function' ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => onSectionChange(ADMIN_SECTION_IDS.emailConnectors)}
          >
            Open Email connectors
          </Button>
        ) : null}
      </AdminPanel>
    </div>
  );
}
