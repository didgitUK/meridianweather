'use client';

import { useState } from 'react';
import { AdminEmailActivateModal } from '@/features/admin/components/email-connectors/AdminEmailActivateModal';
import { AdminEmailActiveConnector } from '@/features/admin/components/email-connectors/AdminEmailActiveConnector';
import { AdminEmailConnectorPicker } from '@/features/admin/components/email-connectors/AdminEmailConnectorPicker';
import { useDebouncedAdminSave } from '@/features/admin/hooks/useDebouncedAdminSave';
import {
  EMAIL_PROVIDERS,
  isActivatableEmailProvider,
} from '@/constants/email-providers';

async function patchAdminConfig(partial) {
  const response = await fetch('/api/admin/config', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partial),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? 'Unable to save email connector settings');
  }

  return payload;
}

export function AdminEmailConnectorsPanel({ settings, emailConnectors, onUpdated, onRefresh }) {
  const { save, isSaving, error: saveError } = useDebouncedAdminSave(onUpdated);
  const [activateProviderId, setActivateProviderId] = useState(null);
  const [isActivating, setIsActivating] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [actionError, setActionError] = useState('');

  if (!settings || !emailConnectors) {
    return null;
  }

  const activeProviderId = isActivatableEmailProvider(emailConnectors.emailProvider)
    ? emailConnectors.emailProvider
    : null;

  async function handleActivateSubmit(partial) {
    setIsActivating(true);
    setActionError('');

    try {
      const payload = await patchAdminConfig(partial);
      onUpdated?.(payload);
      setActivateProviderId(null);
      await onRefresh?.();
    } catch (activateError) {
      setActionError(activateError.message);
    } finally {
      setIsActivating(false);
    }
  }

  async function handleDisconnect() {
    setIsDisconnecting(true);
    setActionError('');

    try {
      const payload = await patchAdminConfig({ emailProvider: EMAIL_PROVIDERS.none });
      onUpdated?.(payload);
      await onRefresh?.();
    } catch (disconnectError) {
      setActionError(disconnectError.message);
    } finally {
      setIsDisconnecting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {saveError || actionError ? (
        <p className="text-sm text-destructive">{actionError || saveError}</p>
      ) : null}

      {activeProviderId ? (
        <AdminEmailActiveConnector
          providerId={activeProviderId}
          emailConnectors={emailConnectors}
          isSaving={isSaving}
          isDisconnecting={isDisconnecting}
          onDisconnect={handleDisconnect}
          onSave={save}
          onRefresh={onRefresh}
        />
      ) : (
        <AdminEmailConnectorPicker
          emailConnectors={emailConnectors}
          onActivateRequest={setActivateProviderId}
        />
      )}

      <AdminEmailActivateModal
        key={activateProviderId ?? 'closed'}
        open={Boolean(activateProviderId)}
        providerId={activateProviderId}
        emailConnectors={emailConnectors}
        isSubmitting={isActivating}
        error={actionError}
        onOpenChange={(open) => {
          if (!open) {
            setActivateProviderId(null);
            setActionError('');
          }
        }}
        onSubmit={handleActivateSubmit}
      />
    </div>
  );
}
