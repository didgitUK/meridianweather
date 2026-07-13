'use client';

import { Input } from '@/components/ui/input';
import { AdminEmailSecretField } from '@/features/admin/components/AdminEmailSecretField';
import { AdminField } from '@/features/admin/components/AdminPanel';
import { AdminEmailProviderModuleCard } from '@/features/admin/components/email-connectors/AdminEmailProviderModuleCard';
import { EMAIL_PROVIDERS } from '@/constants/email-providers';

export function AdminResendModule({ emailConnectors, isActive, isSaving, onActivate, onSave, onRefresh }) {
  return (
    <AdminEmailProviderModuleCard
      title="Resend"
      description="Primary connector used by default. Audience ID is required to sync newsletter contacts into Resend Audiences."
      providerId={EMAIL_PROVIDERS.resend}
      isActive={isActive}
      onActivate={onActivate}
    >
      <div className="grid gap-4">
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

        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="From email" hint="Overrides RESEND_FROM_EMAIL when set.">
            <Input
              type="email"
              defaultValue={emailConnectors.resend.fromEmail}
              placeholder="alerts@meridianweather.co.uk"
              onChange={(event) => onSave({ resendFromEmail: event.target.value })}
            />
          </AdminField>

          <AdminField label="Audience ID" hint="Used when syncing newsletter subscribers.">
            <Input
              defaultValue={emailConnectors.resend.audienceId}
              placeholder="aud_…"
              onChange={(event) => onSave({ resendAudienceId: event.target.value })}
            />
          </AdminField>
        </div>
      </div>
    </AdminEmailProviderModuleCard>
  );
}
