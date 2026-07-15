'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/features/admin/components/AdminPanel';
import { formatSubscribedAt } from '@/features/admin/components/subscriptions/AdminSubscriptionListPanel';
import { SUBSCRIPTION_TYPES } from '@/features/subscriptions/utils/subscription-state';
import { buildCsv, downloadCsv } from '@/lib/csv';

/**
 * Compact roster of city_alerts subscribers with a given alert type enabled.
 */
export function AdminMailingListAlertRoster({ alertTypeId, emptyMessage, csvBasename }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const filtered = useMemo(
    () => subscriptions.filter((sub) => Boolean(sub.alertPrefs?.[alertTypeId])),
    [alertTypeId, subscriptions],
  );

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
        throw new Error(payload.message ?? 'Unable to load alert subscribers');
      }

      setSubscriptions(payload.subscriptions ?? []);
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
      if (!cancelled) {
        void load();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [load]);

  const allSelected = useMemo(
    () => filtered.length > 0 && selectedIds.size === filtered.length,
    [filtered, selectedIds],
  );

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filtered.map((sub) => sub.id)));
  }

  function toggleOne(id) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function deleteIds(ids) {
    if (!ids.length) return;

    const confirmed = window.confirm(
      ids.length === 1
        ? 'Permanently delete this location alert subscription (all alert types for that location)?'
        : `Permanently delete ${ids.length} location alert subscriptions?`,
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

  function handleExport() {
    const headers = ['email', 'location', 'subscribedAt', 'id'];
    const rows = filtered.map((sub) => ({
      email: sub.email,
      location: sub.cityName ?? '',
      subscribedAt: sub.createdAt ?? '',
      id: sub.id,
    }));

    downloadCsv(
      `${csvBasename}-${new Date().toISOString().slice(0, 10)}.csv`,
      buildCsv(headers, rows),
    );
  }

  return (
    <AdminPanel
      title="Subscribers"
      description="People with this alert type enabled for a location. Deleting removes the whole location alert subscription."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? 'Loading…'
            : `${filtered.length} active ${filtered.length === 1 ? 'signup' : 'signups'}`}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={!filtered.length}
            onClick={handleExport}
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
      ) : !filtered.length ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-2 pr-3 font-medium">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Location</th>
                <th className="py-2 pr-4 font-medium">Subscribed</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub.id} className="border-b last:border-0">
                  <td className="py-3 pr-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(sub.id)}
                      onChange={() => toggleOne(sub.id)}
                      aria-label={`Select ${sub.email}`}
                    />
                  </td>
                  <td className="py-3 pr-4">{sub.email}</td>
                  <td className="py-3 pr-4">{sub.cityName || '—'}</td>
                  <td className="py-3 pr-4">{formatSubscribedAt(sub.createdAt)}</td>
                  <td className="py-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={isDeleting}
                      onClick={() => deleteIds([sub.id])}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPanel>
  );
}
