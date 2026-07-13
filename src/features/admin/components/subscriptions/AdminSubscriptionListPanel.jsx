'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/features/admin/components/AdminPanel';
import { buildCsv, downloadCsv } from '@/lib/csv';

/**
 * Shared active-subscription list for newsletter / weekly / alerts admin tabs.
 * Only loads active rows — unsubscribed entries are deactivated and omitted.
 */
export function AdminSubscriptionListPanel({
  type,
  title,
  description,
  emptyMessage,
  csvBasename,
  columns,
}) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ type, active: '1' });
      const response = await fetch(`/api/admin/subscriptions?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to load subscriptions');
      }

      setSubscriptions(payload.subscriptions ?? []);
      setTotal(payload.total ?? payload.subscriptions?.length ?? 0);
      setSelectedIds(new Set());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

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
        ? 'Permanently delete this subscription?'
        : `Permanently delete ${ids.length} subscriptions?`,
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
    const headers = columns.map((column) => column.key);
    const rows = subscriptions.map((sub) => {
      const row = {};
      for (const column of columns) {
        row[column.key] = column.value(sub);
      }
      return row;
    });

    downloadCsv(
      `${csvBasename}-${new Date().toISOString().slice(0, 10)}.csv`,
      buildCsv(headers, rows),
    );
  }

  return (
    <AdminPanel title={title} description={description}>
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
      ) : !subscriptions.length ? (
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
                {columns.map((column) => (
                  <th key={column.key} className="py-2 pr-4 font-medium last:pr-0">
                    {column.label}
                  </th>
                ))}
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b last:border-0">
                  <td className="py-3 pr-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(sub.id)}
                      onChange={() => toggleOne(sub.id)}
                      aria-label={`Select ${sub.email}`}
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="py-3 pr-4 last:pr-0">
                      {column.render ? column.render(sub) : column.value(sub)}
                    </td>
                  ))}
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

export function formatSubscribedAt(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-GB');
}
