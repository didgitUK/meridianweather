'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/features/admin/components/AdminPanel';
import { AdminAlertToggle } from '@/features/admin/components/subscriptions/AdminAlertToggle';
import { formatSubscribedAt } from '@/features/admin/components/subscriptions/AdminSubscriptionListPanel';
import {
  ALERT_TYPE_GROUPS,
  ALL_ALERT_TYPES,
  countEnabledAlertPrefs,
  hasAnyAlertPrefEnabled,
} from '@/constants/alert-types';
import { SUBSCRIPTION_TYPES } from '@/features/subscriptions/utils/subscription-state';
import { buildCsv, downloadCsv } from '@/lib/csv';

function exportWeatherAlertsCsv(subscriptions) {
  const headers = [
    'email',
    'location',
    ...ALL_ALERT_TYPES.map((type) => type.id),
    'subscribedAt',
    'id',
  ];

  const rows = subscriptions.map((sub) => {
    const row = {
      email: sub.email,
      location: sub.cityName ?? '',
      subscribedAt: sub.createdAt ?? '',
      id: sub.id,
    };
    for (const type of ALL_ALERT_TYPES) {
      row[type.id] = sub.alertPrefs?.[type.id] ? 'yes' : 'no';
    }
    return row;
  });

  downloadCsv(
    `meridian-weather-alerts-${new Date().toISOString().slice(0, 10)}.csv`,
    buildCsv(headers, rows),
  );
}

export function AdminWeatherAlertsPanel() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [pendingId, setPendingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        type: SUBSCRIPTION_TYPES.alerts,
        active: '1',
      });
      const response = await fetch(`/api/admin/subscriptions?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to load weather alerts');
      }

      setSubscriptions(payload.subscriptions ?? []);
      setTotal(payload.total ?? payload.subscriptions?.length ?? 0);
      setSelectedIds(new Set());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const allSelected = useMemo(
    () => subscriptions.length > 0 && selectedIds.size === subscriptions.length,
    [subscriptions, selectedIds],
  );

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(subscriptions.map((sub) => sub.id)));
  }

  function toggleOne(id) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function patchAlertPref(sub, typeId, nextValue) {
    const nextPrefs = {
      ...sub.alertPrefs,
      [typeId]: nextValue,
    };

    if (!hasAnyAlertPrefEnabled(nextPrefs)) {
      const confirmed = window.confirm(
        `This will remove ${sub.email} from all weather alerts${sub.cityName ? ` for ${sub.cityName}` : ''}. Are you sure?`,
      );
      if (!confirmed) return;
    }

    setPendingId(sub.id);
    setError('');

    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sub.id,
          alertPrefs: { [typeId]: nextValue },
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to update alert preferences');
      }

      if (payload.removed) {
        setSubscriptions((current) => current.filter((row) => row.id !== sub.id));
        setTotal((current) => Math.max(0, current - 1));
        setSelectedIds((current) => {
          const next = new Set(current);
          next.delete(sub.id);
          return next;
        });
        return;
      }

      setSubscriptions((current) =>
        current.map((row) => (row.id === sub.id ? payload.subscription : row)),
      );
    } catch (patchError) {
      setError(patchError.message);
    } finally {
      setPendingId(null);
    }
  }

  async function deleteIds(ids) {
    if (!ids.length) return;

    const confirmed = window.confirm(
      ids.length === 1
        ? 'Permanently delete this weather alert signup?'
        : `Permanently delete ${ids.length} weather alert signups?`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to delete subscriptions');
      }
      await load();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AdminPanel
      title="Alert subscribers"
      description="Per-location alert preferences. Columns are grouped by alert family — scroll horizontally to manage every type."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading…' : `${total} active ${total === 1 ? 'signup' : 'signups'}`}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={!subscriptions.length}
            onClick={() => exportWeatherAlertsCsv(subscriptions)}
          >
            <Download className="size-4" aria-hidden />
            Export CSV
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="gap-1.5"
            disabled={selectedIds.size === 0 || isDeleting}
            onClick={() => deleteIds([...selectedIds])}
          >
            <Trash2 className="size-4" aria-hidden />
            Delete selected ({selectedIds.size})
          </Button>
        </div>
      </div>

      {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading signups…</p>
      ) : !subscriptions.length ? (
        <p className="text-sm text-muted-foreground">No weather alert signups yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th rowSpan={2} className="sticky left-0 z-10 bg-card py-2 pr-3 font-medium">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th rowSpan={2} className="sticky left-10 z-10 bg-card py-2 pr-4 font-medium">
                  Email
                </th>
                <th rowSpan={2} className="py-2 pr-4 font-medium">
                  Location
                </th>
                {ALERT_TYPE_GROUPS.map((group) => (
                  <th
                    key={group.id}
                    colSpan={group.types.length}
                    className="border-l border-border/70 px-2 py-2 text-center text-[11px] font-medium tracking-wide uppercase"
                  >
                    {group.label}
                  </th>
                ))}
                <th rowSpan={2} className="py-2 pr-4 font-medium">
                  On
                </th>
                <th rowSpan={2} className="py-2 pr-4 font-medium">
                  Subscribed
                </th>
                <th rowSpan={2} className="py-2 font-medium">
                  Actions
                </th>
              </tr>
              <tr className="border-b text-muted-foreground">
                {ALERT_TYPE_GROUPS.map((group) =>
                  group.types.map((type) => (
                    <th
                      key={type.id}
                      className="border-l border-border/40 px-1.5 py-2 text-center text-[11px] font-medium"
                      title={`${type.label} · ${type.source}`}
                    >
                      {type.shortLabel ?? type.label}
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => {
                const rowBusy = pendingId === sub.id || isDeleting;
                const enabledCount = countEnabledAlertPrefs(sub.alertPrefs);

                return (
                  <tr key={sub.id} className="border-b last:border-0">
                    <td className="sticky left-0 z-10 bg-card py-3 pr-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(sub.id)}
                        onChange={() => toggleOne(sub.id)}
                        aria-label={`Select ${sub.email}`}
                      />
                    </td>
                    <td className="sticky left-10 z-10 bg-card py-3 pr-4 whitespace-nowrap">
                      {sub.email}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">{sub.cityName || '—'}</td>
                    {ALERT_TYPE_GROUPS.map((group) =>
                      group.types.map((type) => (
                        <td key={type.id} className="border-l border-border/30 px-1.5 py-3 text-center">
                          <div className="flex justify-center">
                            <AdminAlertToggle
                              label={type.label}
                              enabled={Boolean(sub.alertPrefs?.[type.id])}
                              disabled={rowBusy}
                              onToggle={() =>
                                patchAlertPref(sub, type.id, !sub.alertPrefs?.[type.id])
                              }
                            />
                          </div>
                        </td>
                      )),
                    )}
                    <td className="py-3 pr-4 font-tabular">{enabledCount}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {formatSubscribedAt(sub.createdAt)}
                    </td>
                    <td className="py-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={rowBusy}
                        onClick={() => deleteIds([sub.id])}
                      >
                        <Trash2 className="size-4" aria-hidden />
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminPanel>
  );
}
