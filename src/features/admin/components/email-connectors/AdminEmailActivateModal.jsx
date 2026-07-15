'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminResendFields } from '@/features/admin/components/email-connectors/AdminResendFields';
import { AdminSendgridFields } from '@/features/admin/components/email-connectors/AdminSendgridFields';
import { AdminSesFields } from '@/features/admin/components/email-connectors/AdminSesFields';
import { AdminSmtpFields } from '@/features/admin/components/email-connectors/AdminSmtpFields';
import {
  DEFAULT_SES_REGION,
  DEFAULT_SMTP_PORT,
  EMAIL_PROVIDERS,
  EMAIL_PROVIDER_OPTIONS,
} from '@/constants/email-providers';

function buildDraft(providerId, emailConnectors) {
  if (providerId === EMAIL_PROVIDERS.resend) {
    return {
      resendApiKey: '',
      resendFromEmail: emailConnectors.resend.fromEmail || '',
      resendAudienceId: emailConnectors.resend.audienceId || '',
    };
  }

  if (providerId === EMAIL_PROVIDERS.sendgrid) {
    return {
      sendgridApiKey: '',
      sendgridFromEmail: emailConnectors.sendgrid.fromEmail || '',
      sendgridListId: emailConnectors.sendgrid.listId || '',
    };
  }

  if (providerId === EMAIL_PROVIDERS.ses) {
    return {
      sesAccessKeyId: '',
      sesSecretAccessKey: '',
      sesRegion: emailConnectors.ses.region || DEFAULT_SES_REGION,
      sesFromEmail: emailConnectors.ses.fromEmail || '',
    };
  }

  return {
    smtpHost: emailConnectors.smtp.host || '',
    smtpPort: emailConnectors.smtp.port || DEFAULT_SMTP_PORT,
    smtpUser: emailConnectors.smtp.user || '',
    smtpPassword: '',
    smtpFromEmail: emailConnectors.smtp.fromEmail || '',
    smtpSecure: Boolean(emailConnectors.smtp.secure),
  };
}

function draftToPayload(providerId, draft) {
  const payload = { emailProvider: providerId };

  for (const [key, value] of Object.entries(draft)) {
    if (typeof value === 'string' && value.trim() === '') {
      continue;
    }
    payload[key] = value;
  }

  return payload;
}

export function AdminEmailActivateModal({
  open,
  providerId,
  emailConnectors,
  isSubmitting,
  error,
  onOpenChange,
  onSubmit,
}) {
  const [draft, setDraft] = useState(() =>
    providerId ? buildDraft(providerId, emailConnectors) : null,
  );

  const meta = useMemo(
    () => EMAIL_PROVIDER_OPTIONS.find((option) => option.id === providerId) ?? null,
    [providerId],
  );

  function handleDraftChange(partial) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!providerId || !draft) return;
    onSubmit(draftToPayload(providerId, draft));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>Activate {meta?.label ?? 'connector'}</DialogTitle>
          <DialogDescription>
            {meta?.description ?? 'Enter credentials for this outgoing email connector.'} Only one
            connector can be active.
          </DialogDescription>
        </DialogHeader>

        {draft && providerId ? (
          <form id="email-activate-form" className="grid gap-4" onSubmit={handleSubmit}>
            {providerId === EMAIL_PROVIDERS.resend ? (
              <AdminResendFields
                emailConnectors={emailConnectors}
                draft={draft}
                onDraftChange={handleDraftChange}
              />
            ) : null}
            {providerId === EMAIL_PROVIDERS.sendgrid ? (
              <AdminSendgridFields
                emailConnectors={emailConnectors}
                draft={draft}
                onDraftChange={handleDraftChange}
              />
            ) : null}
            {providerId === EMAIL_PROVIDERS.ses ? (
              <AdminSesFields
                emailConnectors={emailConnectors}
                draft={draft}
                onDraftChange={handleDraftChange}
              />
            ) : null}
            {providerId === EMAIL_PROVIDERS.smtp ? (
              <AdminSmtpFields
                emailConnectors={emailConnectors}
                draft={draft}
                onDraftChange={handleDraftChange}
              />
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </form>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="email-activate-form" disabled={isSubmitting || !draft}>
            {isSubmitting ? 'Activating…' : 'Activate connector'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
