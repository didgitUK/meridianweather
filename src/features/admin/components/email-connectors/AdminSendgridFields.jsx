'use client';

import { Input } from '@/components/ui/input';
import { AdminEmailSecretField } from '@/features/admin/components/AdminEmailSecretField';
import { AdminField } from '@/features/admin/components/AdminPanel';
import { EMAIL_PROVIDERS } from '@/constants/email-providers';

export function AdminSendgridFields({
  emailConnectors,
  isSaving,
  onSave,
  onRefresh,
  draft = null,
  onDraftChange = null,
}) {
  const controlled = Boolean(draft && onDraftChange);
  const values = controlled
    ? draft
    : {
        sendgridApiKey: '',
        sendgridFromEmail: emailConnectors.sendgrid.fromEmail,
        sendgridListId: emailConnectors.sendgrid.listId,
      };

  return (
    <div className="grid gap-4">
      {controlled ? (
        <AdminField label="SendGrid API key" hint="Uses SENDGRID_API_KEY from env when left blank.">
          <Input
            type="password"
            autoComplete="off"
            value={values.sendgridApiKey}
            placeholder={emailConnectors.sendgrid.masked || 'SG.…'}
            className="font-mono text-sm"
            onChange={(event) => onDraftChange({ sendgridApiKey: event.target.value })}
          />
        </AdminField>
      ) : (
        <AdminEmailSecretField
          label="SendGrid API key"
          provider={EMAIL_PROVIDERS.sendgrid}
          configured={emailConnectors.sendgrid.configured}
          source={emailConnectors.sendgrid.source}
          masked={emailConnectors.sendgrid.masked}
          views={emailConnectors.sendgrid.views}
          envHint="SENDGRID_API_KEY"
          isSaving={isSaving}
          onSaveKey={(value) => onSave({ sendgridApiKey: value })}
          onRevealed={onRefresh}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="From email" hint="Overrides SENDGRID_FROM_EMAIL when set.">
          <Input
            type="email"
            {...(controlled
              ? {
                  value: values.sendgridFromEmail,
                  onChange: (event) => onDraftChange({ sendgridFromEmail: event.target.value }),
                }
              : {
                  defaultValue: emailConnectors.sendgrid.fromEmail,
                  onChange: (event) => onSave({ sendgridFromEmail: event.target.value }),
                })}
            placeholder="alerts@meridianweather.co.uk"
          />
        </AdminField>

        <AdminField label="Marketing list ID" hint="Used when syncing newsletter subscribers.">
          <Input
            {...(controlled
              ? {
                  value: values.sendgridListId,
                  onChange: (event) => onDraftChange({ sendgridListId: event.target.value }),
                }
              : {
                  defaultValue: emailConnectors.sendgrid.listId,
                  onChange: (event) => onSave({ sendgridListId: event.target.value }),
                })}
            placeholder="List UUID"
          />
        </AdminField>
      </div>
    </div>
  );
}
