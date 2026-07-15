'use client';

import { ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AdminField, AdminPanel } from '@/features/admin/components/AdminPanel';
import { useDebouncedAdminSave } from '@/features/admin/hooks/useDebouncedAdminSave';

export function AdminAlertConnectorsPanel({ settings, alertConnectors, onUpdated }) {
  const { save, isSaving, error } = useDebouncedAdminSave(onUpdated);

  if (!settings || !alertConnectors) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPanel
        title="Alert data feeds"
        description="Official warning sources power severity, flood, environment, and US severe-weather alert types. No API keys required for these public feeds."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <FeedCard
            feed={alertConnectors.openMeteo}
            enabled={Boolean(settings.openMeteoAlertsEnabled ?? alertConnectors.openMeteo.enabled)}
            onToggle={(checked) => save({ openMeteoAlertsEnabled: checked })}
          />
          <FeedCard
            feed={alertConnectors.nws}
            enabled={Boolean(settings.nwsAlertsEnabled ?? alertConnectors.nws.enabled)}
            onToggle={(checked) => save({ nwsAlertsEnabled: checked })}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <AdminField
            label="Wind alert threshold (m/s)"
            hint="OpenWeather-derived wind alerts fire when wind speed meets or exceeds this value."
          >
            <Input
              type="number"
              min={1}
              step={1}
              defaultValue={settings.windAlertThresholdMs ?? alertConnectors.windThresholdMs ?? 15}
              onChange={(event) => save({ windAlertThresholdMs: Number(event.target.value) })}
            />
          </AdminField>
        </div>

        {isSaving ? <p className="mt-3 text-xs text-muted-foreground">Saving…</p> : null}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </AdminPanel>

      <AdminPanel
        title="How feeds map to alert columns"
        description="Subscriber toggles in Email → Mailing Lists decide which matched events trigger email."
      >
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">OpenWeather</span> — rain, wind,
            thunderstorms, snow, fog, and heat from the live conditions snapshot.
          </li>
          <li>
            <span className="font-medium text-foreground">Open-Meteo</span> — yellow/amber/red
            severity, flood, air quality, marine, UV, ice, and lightning when national agencies
            publish warnings.
          </li>
          <li>
            <span className="font-medium text-foreground">NWS</span> — US tornado watch/warning/
            emergency, severe thunderstorm, and tropical cyclone products.
          </li>
        </ul>
      </AdminPanel>
    </div>
  );
}

function FeedCard({ feed, enabled, onToggle }) {
  return (
    <div className="rounded-xl border bg-muted/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{feed.label}</p>
          <p className="mt-1 text-sm text-muted-foreground">{feed.description}</p>
        </div>
        <label className="flex items-center gap-2 text-sm whitespace-nowrap">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => onToggle(event.target.checked)}
          />
          Enabled
        </label>
      </div>
      <p className="mt-3 font-mono text-xs text-muted-foreground break-all">{feed.endpoint}</p>
      {feed.docsUrl ? (
        <a
          href={feed.docsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-foreground underline-offset-2 hover:underline"
        >
          Documentation
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      ) : null}
    </div>
  );
}
