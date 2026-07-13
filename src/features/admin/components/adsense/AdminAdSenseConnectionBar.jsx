'use client';

import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/features/admin/components/AdminPanel';

function formatSyncedAt(iso) {
  if (!iso) {
    return null;
  }

  return new Date(iso).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function AdminAdSenseConnectionBar({
  reporting,
  isSyncing,
  isDisconnecting,
  onConnect,
  onDisconnect,
  onSync,
  error,
}) {
  const connected = Boolean(reporting?.connected);
  const oauthReady = Boolean(reporting?.oauthEnvConfigured);

  return (
    <AdminPanel
      title="Management API"
      description="Connect Google once to pull estimated earnings into this dashboard — no need to open AdSense separately."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">
            {connected ? 'Connected' : 'Not connected'}
          </p>
          <p className="text-sm text-muted-foreground">
            {connected
              ? reporting.accountDisplayName || reporting.accountName || 'AdSense account linked'
              : oauthReady
                ? 'Connect the AdSense account owner to unlock earnings reports.'
                : 'Add GOOGLE_ADSENSE_OAUTH_* env vars, then connect Google.'}
          </p>
          {connected && reporting.lastSyncedAt ? (
            <p className="text-xs text-muted-foreground">
              Last synced {formatSyncedAt(reporting.lastSyncedAt)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {connected ? (
            <>
              <Button type="button" variant="outline" onClick={onSync} disabled={isSyncing}>
                {isSyncing ? 'Refreshing…' : 'Refresh report'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
              </Button>
            </>
          ) : (
            <Button type="button" onClick={onConnect} disabled={!oauthReady}>
              Connect with Google
            </Button>
          )}
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </AdminPanel>
  );
}
