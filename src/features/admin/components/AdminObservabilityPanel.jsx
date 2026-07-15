'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/features/admin/components/AdminPanel';

async function fetchObservability() {
  const response = await fetch('/api/admin/observability?limit=50');
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? 'Unable to load observability data');
  }

  return payload;
}

function MetaLine({ value }) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const text = JSON.stringify(value);
  return <p className="mt-1 break-all text-xs text-muted-foreground">{text.slice(0, 280)}</p>;
}

export function AdminObservabilityPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    setError('');
    try {
      setData(await fetchObservability());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (isLoading && !data) {
    return <p className="text-sm text-muted-foreground">Loading error log…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPanel
        title="Error log & process audit"
        description="Durable SQLite trails for errors, cron runs, email sends, and admin mutations. Filesystem mirrors live under data/logs/."
      >
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={load} disabled={isLoading}>
            {isLoading ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </AdminPanel>

      <AdminPanel title="Recent errors" description="From error_events (API, cron, client boundary).">
        <ul className="flex flex-col gap-3">
          {(data?.errors ?? []).length === 0 ? (
            <li className="text-sm text-muted-foreground">No error events recorded yet.</li>
          ) : (
            (data?.errors ?? []).map((entry) => (
              <li key={entry.id} className="rounded-lg border border-border/70 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">
                    <span className="uppercase text-muted-foreground">{entry.level}</span>
                    {' · '}
                    {entry.source}
                  </p>
                  <time className="text-xs text-muted-foreground" dateTime={entry.timestamp}>
                    {entry.timestamp}
                  </time>
                </div>
                <p className="mt-1 text-sm">{entry.message}</p>
                {entry.correlationId ? (
                  <p className="mt-1 text-xs text-muted-foreground">corr: {entry.correlationId}</p>
                ) : null}
                <MetaLine value={entry.meta} />
              </li>
            ))
          )}
        </ul>
      </AdminPanel>

      <AdminPanel title="Process runs" description="Cron jobs (weather-alerts, weekly-digests).">
        <ul className="flex flex-col gap-3">
          {(data?.processRuns ?? []).length === 0 ? (
            <li className="text-sm text-muted-foreground">No process runs recorded yet.</li>
          ) : (
            (data?.processRuns ?? []).map((run) => (
              <li key={run.id} className="rounded-lg border border-border/70 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">
                    {run.job}
                    {' · '}
                    <span className="text-muted-foreground">{run.status}</span>
                  </p>
                  <time className="text-xs text-muted-foreground" dateTime={run.startedAt}>
                    {run.startedAt}
                  </time>
                </div>
                {run.errorSummary ? (
                  <p className="mt-1 text-sm text-destructive">{run.errorSummary}</p>
                ) : null}
                <MetaLine value={run.counts} />
              </li>
            ))
          )}
        </ul>
      </AdminPanel>

      <AdminPanel title="Email sends" description="Transactional send attempts (recipient redacted).">
        <ul className="flex flex-col gap-3">
          {(data?.emailSends ?? []).length === 0 ? (
            <li className="text-sm text-muted-foreground">No email sends recorded yet.</li>
          ) : (
            (data?.emailSends ?? []).map((entry) => (
              <li key={entry.id} className="rounded-lg border border-border/70 p-3 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span>
                    {entry.status} · {entry.provider}
                    {entry.templateSlug ? ` · ${entry.templateSlug}` : ''}
                  </span>
                  <time className="text-xs text-muted-foreground" dateTime={entry.timestamp}>
                    {entry.timestamp}
                  </time>
                </div>
                <p className="mt-1 text-muted-foreground">{entry.recipientFingerprint}</p>
                {entry.reason ? <p className="mt-1 text-xs">{entry.reason}</p> : null}
              </li>
            ))
          )}
        </ul>
      </AdminPanel>

      <AdminPanel title="Admin audit" description="Mutations and auth events from admin_audit_log.">
        <ul className="flex flex-col gap-3">
          {(data?.adminAudit ?? []).length === 0 ? (
            <li className="text-sm text-muted-foreground">No admin audit events yet.</li>
          ) : (
            (data?.adminAudit ?? []).map((entry) => (
              <li key={entry.id} className="rounded-lg border border-border/70 p-3">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="text-sm font-medium">{entry.action}</p>
                  <time className="text-xs text-muted-foreground" dateTime={entry.timestamp}>
                    {entry.timestamp}
                  </time>
                </div>
                <MetaLine value={entry.meta} />
              </li>
            ))
          )}
        </ul>
      </AdminPanel>
    </div>
  );
}
