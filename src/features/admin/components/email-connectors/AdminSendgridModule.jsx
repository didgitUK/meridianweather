'use client';

import { Input } from '@/components/ui/input';
import { AdminEmailSecretField } from '@/features/admin/components/AdminEmailSecretField';
import { AdminField } from '@/features/admin/components/AdminPanel';
import { AdminEmailProviderModuleCard } from '@/features/admin/components/email-connectors/AdminEmailProviderModuleCard';
import { EMAIL_PROVIDERS } from '@/constants/email-providers';

export function AdminSendgridModule({
  emailConnectors,
  isActive,
  isSaving,
  onActivate,
  onSave,
  onRefresh,
}) {
  return (
    <AdminEmailProviderModuleCard
      title="SendGrid"
      description="Optional connector. Marketing list ID is required to sync newsletter contacts into SendGrid Marketing Campaigns."
      providerId={EMAIL_PROVIDERS.sendgrid}
      isActive={isActive}
      onActivate={onActivate}
    >
      <div className="grid gap-4">
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

        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="From email" hint="Overrides SENDGRID_FROM_EMAIL when set.">
            <Input
              type="email"
              defaultValue={emailConnectors.sendgrid.fromEmail}
              placeholder="alerts@meridianweather.co.uk"
              onChange={(event) => onSave({ sendgridFromEmail: event.target.value })}
            />
          </AdminField>

          <AdminField label="Marketing list ID" hint="Used when syncing newsletter subscribers.">
            <Input
              defaultValue={emailConnectors.sendgrid.listId}
              placeholder="List UUID"
              onChange={(event) => onSave({ sendgridListId: event.target.value })}
            />
          </AdminField>
        </div>
      </div>
    </AdminEmailProviderModuleCard>
  );
}
