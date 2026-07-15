'use client';

import { Input } from '@/components/ui/input';
import { AdminEmailSecretField } from '@/features/admin/components/AdminEmailSecretField';
import { AdminField } from '@/features/admin/components/AdminPanel';
import { EMAIL_PROVIDERS } from '@/constants/email-providers';

export function AdminResendFields({
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
        resendApiKey: '',
        resendFromEmail: emailConnectors.resend.fromEmail,
        resendAudienceId: emailConnectors.resend.audienceId,
      };

  return (
    <div className="grid gap-4">
      {controlled ? (
        <AdminField label="Resend API key" hint="Uses RESEND_API_KEY from env when left blank.">
          <Input
            type="password"
            autoComplete="off"
            value={values.resendApiKey}
            placeholder={emailConnectors.resend.masked || 're_…'}
            className="font-mono text-sm"
            onChange={(event) => onDraftChange({ resendApiKey: event.target.value })}
          />
        </AdminField>
      ) : (
        <AdminEmailSecretField
          label="Resend API key"
          provider={EMAIL_PROVIDERS.resend}
          configured={emailConnectors.resend.configured}
          source={emailConnectors.resend.source}
          masked={emailConnectors.resend.masked}
          views={emailConnectors.resend.views}
          envHint="RESEND_API_KEY"
          isSaving={isSaving}
          onSaveKey={(value) => onSave({ resendApiKey: value })}
          onRevealed={onRefresh}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="From email" hint="Overrides RESEND_FROM_EMAIL when set.">
          <Input
            type="email"
            {...(controlled
              ? {
                  value: values.resendFromEmail,
                  onChange: (event) => onDraftChange({ resendFromEmail: event.target.value }),
                }
              : {
                  defaultValue: emailConnectors.resend.fromEmail,
                  onChange: (event) => onSave({ resendFromEmail: event.target.value }),
                })}
            placeholder="alerts@meridianweather.co.uk"
          />
        </AdminField>

        <AdminField label="Audience ID" hint="Used when syncing newsletter subscribers.">
          <Input
            {...(controlled
              ? {
                  value: values.resendAudienceId,
                  onChange: (event) => onDraftChange({ resendAudienceId: event.target.value }),
                }
              : {
                  defaultValue: emailConnectors.resend.audienceId,
                  onChange: (event) => onSave({ resendAudienceId: event.target.value }),
                })}
            placeholder="aud_…"
          />
        </AdminField>
      </div>
    </div>
  );
}
