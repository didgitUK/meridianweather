'use client';

import { Input } from '@/components/ui/input';
import { AdminEmailSecretField } from '@/features/admin/components/AdminEmailSecretField';
import { AdminField } from '@/features/admin/components/AdminPanel';
import { AdminEmailProviderModuleCard } from '@/features/admin/components/email-connectors/AdminEmailProviderModuleCard';
import { DEFAULT_SES_REGION, EMAIL_PROVIDERS } from '@/constants/email-providers';

export function AdminSesModule({ emailConnectors, isActive, isSaving, onActivate, onSave, onRefresh }) {
  const ses = emailConnectors.ses;

  return (
    <AdminEmailProviderModuleCard
      title="Amazon SES"
      description="AWS Simple Email Service connector. Send and audience sync are scaffolded until the SES agent wires the AWS SDK."
      providerId={EMAIL_PROVIDERS.ses}
      isActive={isActive}
      onActivate={onActivate}
    >
      <div className="grid gap-4">
        <AdminField
          label="Access key ID"
          hint={
            ses.accessKeyIdConfigured
              ? `Configured (${ses.source ?? 'unknown'}). Enter a new value to replace.`
              : 'Uses AWS_ACCESS_KEY_ID from env when empty.'
          }
        >
          <Input
            type="text"
            defaultValue=""
            placeholder={ses.accessKeyIdMasked || 'AKIA…'}
            className="font-mono text-sm"
            onChange={(event) => onSave({ sesAccessKeyId: event.target.value })}
          />
        </AdminField>

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

        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Region" hint="Overrides AWS_SES_REGION when set.">
            <Input
              defaultValue={ses.region || DEFAULT_SES_REGION}
              placeholder={DEFAULT_SES_REGION}
              onChange={(event) => onSave({ sesRegion: event.target.value })}
            />
          </AdminField>

          <AdminField label="From email" hint="Overrides AWS_SES_FROM_EMAIL when set.">
            <Input
              type="email"
              defaultValue={ses.fromEmail}
              placeholder="alerts@meridianweather.co.uk"
              onChange={(event) => onSave({ sesFromEmail: event.target.value })}
            />
          </AdminField>
        </div>
      </div>
    </AdminEmailProviderModuleCard>
  );
}
