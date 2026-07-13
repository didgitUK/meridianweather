'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminField, AdminPanel } from '@/features/admin/components/AdminPanel';
import { AdminUnderDevelopmentOverlay } from '@/features/admin/components/AdminUnderDevelopmentOverlay';
import { AdminResendModule } from '@/features/admin/components/email-connectors/AdminResendModule';
import { AdminSendgridModule } from '@/features/admin/components/email-connectors/AdminSendgridModule';
import { AdminSesModule } from '@/features/admin/components/email-connectors/AdminSesModule';
import { useDebouncedAdminSave } from '@/features/admin/hooks/useDebouncedAdminSave';
import { EMAIL_PROVIDERS } from '@/constants/email-providers';

export function AdminEmailConnectorsPanel({ settings, emailConnectors, onUpdated, onRefresh }) {
  const { save, isSaving, error } = useDebouncedAdminSave(onUpdated);
  const [testEmail, setTestEmail] = useState('');
  const [testStatus, setTestStatus] = useState('');
  const [testError, setTestError] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [syncError, setSyncError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  if (!settings || !emailConnectors) {
    return null;
  }

  const provider = emailConnectors.emailProvider || EMAIL_PROVIDERS.resend;

  function handleActivate(providerId) {
    save({ emailProvider: providerId });
  }

  async function handleTestSend() {
    setIsTesting(true);
    setTestStatus('');
    setTestError('');

    try {
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to send test email');
      }

      if (payload.sent === false) {
        throw new Error(payload.message ?? payload.reason ?? 'Test email was not sent');
      }

      setTestStatus(`Sent via ${payload.provider} from ${payload.fromEmail}`);
    } catch (sendError) {
      setTestError(sendError.message);
    } finally {
      setIsTesting(false);
    }
  }

  async function handleSync() {
    setIsSyncing(true);
    setSyncStatus('');
    setSyncError('');

    try {
      const response = await fetch('/api/admin/email/sync', { method: 'POST' });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to sync newsletter contacts');
      }

      setSyncStatus(`Synced ${payload.count} contact(s) to ${payload.provider}`);
      onUpdated?.({ emailConnectors: payload.emailConnectors });
      await onRefresh?.();
    } catch (syncErr) {
      setSyncError(syncErr.message);
    } finally {
      setIsSyncing(false);
    }
  }

  const syncTargetLabel =
    provider === EMAIL_PROVIDERS.sendgrid
      ? 'the SendGrid marketing list'
      : provider === EMAIL_PROVIDERS.ses
        ? 'Amazon SES (not available yet)'
        : 'the Resend audience';

  return (
    <AdminUnderDevelopmentOverlay message="Connectors to External Mailing Systems are currently under development">
      <div className="flex flex-col gap-4">
        {isSaving ? <p className="text-xs text-muted-foreground">Saving…</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <AdminResendModule
          emailConnectors={emailConnectors}
          isActive={provider === EMAIL_PROVIDERS.resend}
          isSaving={isSaving}
          onActivate={handleActivate}
          onSave={save}
          onRefresh={onRefresh}
        />

        <AdminSendgridModule
          emailConnectors={emailConnectors}
          isActive={provider === EMAIL_PROVIDERS.sendgrid}
          isSaving={isSaving}
          onActivate={handleActivate}
          onSave={save}
          onRefresh={onRefresh}
        />

        <AdminSesModule
          emailConnectors={emailConnectors}
          isActive={provider === EMAIL_PROVIDERS.ses}
          isSaving={isSaving}
          onActivate={handleActivate}
          onSave={save}
          onRefresh={onRefresh}
        />

        <AdminPanel
          title="Test & sync"
          description="Send a test message through the active connector, or push active newsletter emails into the connected audience/list."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <AdminField label="Test recipient">
                <Input
                  type="email"
                  value={testEmail}
                  placeholder="you@example.com"
                  onChange={(event) => setTestEmail(event.target.value)}
                  tabIndex={-1}
                />
              </AdminField>
              <Button
                type="button"
                variant="outline"
                disabled
                tabIndex={-1}
                onClick={handleTestSend}
              >
                {isTesting ? 'Sending…' : 'Send test email'}
              </Button>
              {testStatus ? <p className="text-sm text-muted-foreground">{testStatus}</p> : null}
              {testError ? <p className="text-sm text-destructive">{testError}</p> : null}
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Sync pushes active newsletter subscribers to {syncTargetLabel} configured above.
              </p>
              <Button type="button" disabled tabIndex={-1} onClick={handleSync}>
                {isSyncing ? 'Syncing…' : 'Sync newsletter contacts'}
              </Button>
              {syncStatus ? <p className="text-sm text-muted-foreground">{syncStatus}</p> : null}
              {syncError ? <p className="text-sm text-destructive">{syncError}</p> : null}
            </div>
          </div>
        </AdminPanel>
      </div>
    </AdminUnderDevelopmentOverlay>
  );
}
