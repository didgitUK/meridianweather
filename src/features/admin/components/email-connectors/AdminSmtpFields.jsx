'use client';

import { Input } from '@/components/ui/input';
import { AdminEmailSecretField } from '@/features/admin/components/AdminEmailSecretField';
import { AdminField } from '@/features/admin/components/AdminPanel';
import { DEFAULT_SMTP_PORT, EMAIL_PROVIDERS } from '@/constants/email-providers';

export function AdminSmtpFields({
  emailConnectors,
  isSaving,
  onSave,
  onRefresh,
  draft = null,
  onDraftChange = null,
}) {
  const smtp = emailConnectors.smtp;
  const controlled = Boolean(draft && onDraftChange);
  const values = controlled
    ? draft
    : {
        smtpHost: smtp.host,
        smtpPort: smtp.port || DEFAULT_SMTP_PORT,
        smtpUser: smtp.user,
        smtpPassword: '',
        smtpFromEmail: smtp.fromEmail,
        smtpSecure: Boolean(smtp.secure),
      };

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Host" hint="Overrides SMTP_HOST when set.">
          <Input
            type="text"
            className="font-mono text-sm"
            placeholder="smtp.example.com"
            {...(controlled
              ? {
                  value: values.smtpHost,
                  onChange: (event) => onDraftChange({ smtpHost: event.target.value }),
                }
              : {
                  defaultValue: smtp.host,
                  onChange: (event) => onSave({ smtpHost: event.target.value }),
                })}
          />
        </AdminField>

        <AdminField label="Port" hint="Common values: 587 (STARTTLS) or 465 (TLS).">
          <Input
            type="number"
            min={1}
            max={65535}
            placeholder={String(DEFAULT_SMTP_PORT)}
            {...(controlled
              ? {
                  value: values.smtpPort,
                  onChange: (event) => onDraftChange({ smtpPort: Number(event.target.value) }),
                }
              : {
                  defaultValue: smtp.port || DEFAULT_SMTP_PORT,
                  onChange: (event) => onSave({ smtpPort: Number(event.target.value) }),
                })}
          />
        </AdminField>
      </div>

      <AdminField label="Username" hint="Overrides SMTP_USER when set.">
        <Input
          type="text"
          autoComplete="off"
          placeholder="mailer@example.com"
          {...(controlled
            ? {
                value: values.smtpUser,
                onChange: (event) => onDraftChange({ smtpUser: event.target.value }),
              }
            : {
                defaultValue: smtp.user,
                onChange: (event) => onSave({ smtpUser: event.target.value }),
              })}
        />
      </AdminField>

      {controlled ? (
        <AdminField label="Password" hint="Uses SMTP_PASSWORD from env when blank.">
          <Input
            type="password"
            autoComplete="off"
            value={values.smtpPassword}
            placeholder={smtp.masked || 'Password'}
            className="font-mono text-sm"
            onChange={(event) => onDraftChange({ smtpPassword: event.target.value })}
          />
        </AdminField>
      ) : (
        <AdminEmailSecretField
          label="Password"
          provider={EMAIL_PROVIDERS.smtp}
          configured={Boolean(smtp.secretConfigured)}
          source={smtp.source}
          masked={smtp.masked}
          views={smtp.views}
          envHint="SMTP_PASSWORD"
          isSaving={isSaving}
          onSaveKey={(value) => onSave({ smtpPassword: value })}
          onRevealed={onRefresh}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="From email" hint="Overrides SMTP_FROM_EMAIL when set.">
          <Input
            type="email"
            placeholder="alerts@meridianweather.co.uk"
            {...(controlled
              ? {
                  value: values.smtpFromEmail,
                  onChange: (event) => onDraftChange({ smtpFromEmail: event.target.value }),
                }
              : {
                  defaultValue: smtp.fromEmail,
                  onChange: (event) => onSave({ smtpFromEmail: event.target.value }),
                })}
          />
        </AdminField>

        <AdminField label="Use TLS (port 465)" hint="Leave off for STARTTLS on 587.">
          <label className="flex h-9 items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              {...(controlled
                ? {
                    checked: Boolean(values.smtpSecure),
                    onChange: (event) => onDraftChange({ smtpSecure: event.target.checked }),
                  }
                : {
                    defaultChecked: Boolean(smtp.secure),
                    onChange: (event) => onSave({ smtpSecure: event.target.checked }),
                  })}
            />
            Require implicit TLS
          </label>
        </AdminField>
      </div>
    </div>
  );
}
