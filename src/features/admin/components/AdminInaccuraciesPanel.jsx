'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { INACCURACY_AUTO_DISMISS_DAY_OPTIONS } from '@/constants/admin';
import { Button } from '@/components/ui/button';
import { AdminField, AdminPanel } from '@/features/admin/components/AdminPanel';
import { useDebouncedAdminSave } from '@/features/admin/hooks/useDebouncedAdminSave';
import { buildCsv, downloadCsv } from '@/lib/csv';

function formatReportedAt(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString('en-GB');
}

function daysOpen(reportedAt) {
  if (!reportedAt) {
    return '';
  }

  const ms = Date.now() - new Date(reportedAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) {
    return '';
  }

  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

function exportInaccuraciesCsv(reports) {
  const headers = [
    'location',
    'name',
    'country',
    'state',
    'lat',
    'lon',
    'reportedAt',
    'daysOpen',
    'locationId',
  ];

  const rows = reports.map((report) => ({
    location: report.label ?? report.name ?? 'Unknown location',
    name: report.name ?? '',
    country: report.country ?? '',
    state: report.state ?? '',
    lat: report.lat,
    lon: report.lon,
    reportedAt: report.inaccurateReportedAt ?? '',
    daysOpen: daysOpen(report.inaccurateReportedAt),
    locationId: report.id,
  }));

  downloadCsv(
    `meridian-inaccuracy-issues-${new Date().toISOString().slice(0, 10)}.csv`,
    buildCsv(headers, rows),
  );
}

export function AdminInaccuraciesPanel({ settings, reports, onUpdated, onRefresh }) {
  const { save, isSaving, error } = useDebouncedAdminSave(onUpdated);
  const [pendingLocationId, setPendingLocationId] = useState(null);

  async function handleDismiss(locationId) {
    setPendingLocationId(locationId);

    try {
      const response = await fetch('/api/admin/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, inaccurateReportActive: false }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to dismiss report');
      }

      await onRefresh?.();
    } finally {
      setPendingLocationId(null);
    }
  }

  if (!settings) {
    return null;
  }

  const activeReports = reports ?? [];

  return (
    <div className="flex flex-col gap-4">
      <AdminPanel
        title="Inaccuracy auto-dismiss"
        description="When enabled, location banners clear automatically after the chosen number of days. When disabled, banners stay until an admin dismisses them."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Auto-dismiss reports">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(settings.inaccuracyAutoDismissEnabled)}
                onChange={(event) => save({ inaccuracyAutoDismissEnabled: event.target.checked })}
              />
              Clear banners automatically after X days
            </label>
          </AdminField>

          <AdminField
            label="Auto-dismiss after"
            hint="Only applied while auto-dismiss is enabled."
          >
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={settings.inaccuracyAutoDismissDays ?? 7}
              disabled={!settings.inaccuracyAutoDismissEnabled}
              onChange={(event) => save({ inaccuracyAutoDismissDays: Number(event.target.value) })}
            >
              {INACCURACY_AUTO_DISMISS_DAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </AdminField>
        </div>

        {isSaving ? <p className="mt-3 text-xs text-muted-foreground">Saving…</p> : null}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </AdminPanel>

      <AdminPanel
        title="Inaccuracy issues"
        description="User-reported inaccurate weather data, oldest first."
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {activeReports.length} open {activeReports.length === 1 ? 'issue' : 'issues'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={activeReports.length === 0}
            onClick={() => exportInaccuraciesCsv(activeReports)}
          >
            <Download className="size-4" aria-hidden />
            Export CSV
          </Button>
        </div>

        {activeReports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open inaccuracy reports.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Location</th>
                  <th className="py-2 pr-4 font-medium">Coordinates</th>
                  <th className="py-2 pr-4 font-medium">Reported</th>
                  <th className="py-2 pr-4 font-medium">Days open</th>
                  <th className="py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeReports.map((report) => (
                  <tr key={report.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      {report.label ?? report.name ?? 'Unknown location'}
                    </td>
                    <td className="py-3 pr-4 font-tabular">
                      {report.lat}, {report.lon}
                    </td>
                    <td className="py-3 pr-4">{formatReportedAt(report.inaccurateReportedAt)}</td>
                    <td className="py-3 pr-4 font-tabular">
                      {daysOpen(report.inaccurateReportedAt) === ''
                        ? '—'
                        : daysOpen(report.inaccurateReportedAt)}
                    </td>
                    <td className="py-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pendingLocationId === report.id}
                        onClick={() => handleDismiss(report.id)}
                      >
                        Dismiss banner
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
