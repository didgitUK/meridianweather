'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminField, AdminPanel } from '@/features/admin/components/AdminPanel';
import { AdminResendFields } from '@/features/admin/components/email-connectors/AdminResendFields';
import { AdminSendgridFields } from '@/features/admin/components/email-connectors/AdminSendgridFields';
import { AdminSesFields } from '@/features/admin/components/email-connectors/AdminSesFields';
import { AdminSmtpFields } from '@/features/admin/components/email-connectors/AdminSmtpFields';
import {
  EMAIL_PROVIDERS,
  EMAIL_PROVIDER_OPTIONS,
} from '@/constants/email-providers';

function statusTone(configured) {
  return configured ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400';
}

export function AdminEmailActiveConnector({
  providerId,
  emailConnectors,
  isSaving,
  isDisconnecting,
  onDisconnect,
  onSave,
  onRefresh,
}) {
  const [testEmail, setTestEmail] = useState('');
  const [testStatus, setTestStatus] = useState('');
  const [testError, setTestError] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [syncError, setSyncError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const meta = EMAIL_PROVIDER_OPTIONS.find((option) => option.id === providerId);
  const moduleConfig =
    providerId === EMAIL_PROVIDERS.resend
      ? emailConnectors.resend
      : providerId === EMAIL_PROVIDERS.sendgrid
        ? emailConnectors.sendgrid
        : providerId === EMAIL_PROVIDERS.ses
          ? emailConnectors.ses
          : emailConnectors.smtp;

  const configured = Boolean(moduleConfig?.configured);
  const fromEmail = emailConnectors.activeFromEmail || moduleConfig?.fromEmail || '—';

  const isMeridianLocalAudience =
    providerId === EMAIL_PROVIDERS.ses || providerId === EMAIL_PROVIDERS.smtp;

  const syncTargetLabel =
    providerId === EMAIL_PROVIDERS.sendgrid
      ? 'the SendGrid marketing list'
      : providerId === EMAIL_PROVIDERS.resend
        ? 'the Resend audience'
        : null;

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
      await onRefresh?.();
    } catch (syncErr) {
      setSyncError(syncErr.message);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Active connector
          </p>
          <h2 className="font-heading text-2xl leading-tight">{meta?.label ?? providerId}</h2>
          <p className="text-sm text-muted-foreground">{meta?.description}</p>
          <p className={`mt-2 text-sm font-medium ${statusTone(configured)}`}>
            {configured ? 'Configured' : 'Needs credentials'}
            {moduleConfig?.source ? ` · ${moduleConfig.source}` : ''}
            {fromEmail ? ` · From ${fromEmail}` : ''}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          disabled={isDisconnecting}
          onClick={onDisconnect}
        >
          {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
        </Button>
      </div>

      <AdminPanel
        title="Connector settings"
        description="Update credentials for the active sender. Changes save automatically."
      >
        {isSaving ? <p className="mb-3 text-xs text-muted-foreground">Saving…</p> : null}

        {providerId === EMAIL_PROVIDERS.resend ? (
          <AdminResendFields
            emailConnectors={emailConnectors}
            isSaving={isSaving}
            onSave={onSave}
            onRefresh={onRefresh}
          />
        ) : null}
        {providerId === EMAIL_PROVIDERS.sendgrid ? (
          <AdminSendgridFields
            emailConnectors={emailConnectors}
            isSaving={isSaving}
            onSave={onSave}
            onRefresh={onRefresh}
          />
        ) : null}
        {providerId === EMAIL_PROVIDERS.ses ? (
          <AdminSesFields
            emailConnectors={emailConnectors}
            isSaving={isSaving}
            onSave={onSave}
            onRefresh={onRefresh}
          />
        ) : null}
        {providerId === EMAIL_PROVIDERS.smtp ? (
          <AdminSmtpFields
            emailConnectors={emailConnectors}
            isSaving={isSaving}
            onSave={onSave}
            onRefresh={onRefresh}
          />
        ) : null}
      </AdminPanel>

      <AdminPanel
        title="Test & sync"
        description="Send a test message through this connector, or push newsletter contacts to the connected audience/list."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <AdminField label="Test recipient">
              <Input
                type="email"
                value={testEmail}
                placeholder="you@example.com"
                onChange={(event) => setTestEmail(event.target.value)}
              />
            </AdminField>
            <Button
              type="button"
              variant="outline"
              disabled={isTesting || !testEmail.trim()}
              onClick={handleTestSend}
            >
              {isTesting ? 'Sending…' : 'Send test email'}
            </Button>
            {testStatus ? <p className="text-sm text-muted-foreground">{testStatus}</p> : null}
            {testError ? <p className="text-sm text-destructive">{testError}</p> : null}
          </div>

          <div className="flex flex-col gap-3">
            {isMeridianLocalAudience ? (
              <p className="text-sm text-muted-foreground">
                Newsletter and alert contacts stay in Meridian only for this connector — SES and SMTP
                have no ESP audience sync.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sync pushes active newsletter subscribers to {syncTargetLabel}.
              </p>
            )}
            <Button
              type="button"
              disabled={isSyncing || isMeridianLocalAudience}
              onClick={handleSync}
            >
              {isSyncing ? 'Syncing…' : 'Sync newsletter contacts'}
            </Button>
            {syncStatus ? <p className="text-sm text-muted-foreground">{syncStatus}</p> : null}
            {syncError ? <p className="text-sm text-destructive">{syncError}</p> : null}
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
