'use client';

import { Input } from '@/components/ui/input';
import { AdminEmailSecretField } from '@/features/admin/components/AdminEmailSecretField';
import { AdminField } from '@/features/admin/components/AdminPanel';
import { DEFAULT_SES_REGION, EMAIL_PROVIDERS } from '@/constants/email-providers';

export function AdminSesFields({
  emailConnectors,
  isSaving,
  onSave,
  onRefresh,
  draft = null,
  onDraftChange = null,
}) {
  const ses = emailConnectors.ses;
  const controlled = Boolean(draft && onDraftChange);
  const values = controlled
    ? draft
    : {
        sesAccessKeyId: '',
        sesSecretAccessKey: '',
        sesRegion: ses.region || DEFAULT_SES_REGION,
        sesFromEmail: ses.fromEmail,
      };

  return (
    <div className="grid gap-4">
      <AdminField
        label="Access key ID"
        hint={
          ses.accessKeyIdConfigured && !controlled
            ? `Configured (${ses.source ?? 'unknown'}). Enter a new value to replace.`
            : 'Uses AWS_ACCESS_KEY_ID from env when empty.'
        }
      >
        <Input
          type="text"
          autoComplete="off"
          className="font-mono text-sm"
          placeholder={ses.accessKeyIdMasked || 'AKIA…'}
          {...(controlled
            ? {
                value: values.sesAccessKeyId,
                onChange: (event) => onDraftChange({ sesAccessKeyId: event.target.value }),
              }
            : {
                defaultValue: '',
                onChange: (event) => onSave({ sesAccessKeyId: event.target.value }),
              })}
        />
      </AdminField>

      {controlled ? (
        <AdminField label="Secret access key" hint="Uses AWS_SECRET_ACCESS_KEY from env when blank.">
          <Input
            type="password"
            autoComplete="off"
            value={values.sesSecretAccessKey}
            placeholder={ses.masked || 'Secret'}
            className="font-mono text-sm"
            onChange={(event) => onDraftChange({ sesSecretAccessKey: event.target.value })}
          />
        </AdminField>
      ) : (
        <AdminEmailSecretField
          label="Secret access key"
          provider={EMAIL_PROVIDERS.ses}
          configured={Boolean(ses.secretConfigured)}
          source={ses.source}
          masked={ses.masked}
          views={ses.views}
          envHint="AWS_SECRET_ACCESS_KEY"
          isSaving={isSaving}
          onSaveKey={(value) => onSave({ sesSecretAccessKey: value })}
          onRevealed={onRefresh}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Region" hint="Overrides AWS_SES_REGION when set.">
          <Input
            placeholder={DEFAULT_SES_REGION}
            {...(controlled
              ? {
                  value: values.sesRegion,
                  onChange: (event) => onDraftChange({ sesRegion: event.target.value }),
                }
              : {
                  defaultValue: ses.region || DEFAULT_SES_REGION,
                  onChange: (event) => onSave({ sesRegion: event.target.value }),
                })}
          />
        </AdminField>

        <AdminField label="From email" hint="Overrides AWS_SES_FROM_EMAIL when set.">
          <Input
            type="email"
            placeholder="alerts@meridianweather.co.uk"
            {...(controlled
              ? {
                  value: values.sesFromEmail,
                  onChange: (event) => onDraftChange({ sesFromEmail: event.target.value }),
                }
              : {
                  defaultValue: ses.fromEmail,
                  onChange: (event) => onSave({ sesFromEmail: event.target.value }),
                })}
          />
        </AdminField>
      </div>
    </div>
  );
}
