'use client';

import { PreferenceToggle } from '@/components/layout/settings/PreferenceToggle';
import { AdminPanel } from '@/features/admin/components/AdminPanel';

export function AdminEmailProviderModuleCard({
  title,
  description,
  providerId,
  isActive,
  onActivate,
  children,
}) {
  const switchId = `email-provider-active-${providerId}`;

  return (
    <AdminPanel title={title} description={description}>
      <div className="mb-4 flex flex-col gap-3">
        <PreferenceToggle
          id={switchId}
          label="Active sender"
          description={
            isActive
              ? 'Transactional emails send through this connector.'
              : 'Turn on to make this the active email connector.'
          }
          checked={isActive}
          onCheckedChange={(checked) => {
            if (checked) {
              onActivate(providerId);
            }
          }}
        />
        {isActive ? (
          <p className="text-xs font-medium text-foreground">Active sender</p>
        ) : (
          <p className="text-xs text-muted-foreground">Inactive — credentials can still be edited.</p>
        )}
      </div>
      {children}
    </AdminPanel>
  );
}
