'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EMAIL_PROVIDER_OPTIONS } from '@/constants/email-providers';

export function AdminEmailConnectorPicker({ emailConnectors, onActivateRequest }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Choose one outgoing email connector. Only one can be active at a time.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {EMAIL_PROVIDER_OPTIONS.map((option) => {
          const moduleConfig =
            option.id === 'resend'
              ? emailConnectors.resend
              : option.id === 'sendgrid'
                ? emailConnectors.sendgrid
                : option.id === 'ses'
                  ? emailConnectors.ses
                  : emailConnectors.smtp;
          const hasCredentials = Boolean(moduleConfig?.configured);

          return (
            <div
              key={option.id}
              className={cn(
                'flex flex-col gap-4 rounded-xl border bg-card p-5 transition-colors',
                'hover:border-foreground/20',
              )}
            >
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-lg leading-tight">{option.label}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{option.description}</p>
              </div>

              <p className="text-xs text-muted-foreground">
                {hasCredentials
                  ? `Credentials on file (${moduleConfig.source ?? 'saved'}). Activate to use them.`
                  : 'Not configured yet.'}
              </p>

              <Button type="button" className="mt-auto w-full sm:w-auto" onClick={() => onActivateRequest(option.id)}>
                Activate
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
