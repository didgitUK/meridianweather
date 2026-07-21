'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAdFree } from '@/providers/AdFreeProvider';
import { ADFEEE_PLAN_IDS } from '@/constants/billing';
import { cn } from '@/lib/utils';

export function AdFreePlansPanel() {
  const t = useTranslations('Settings.adFree');
  const {
    isAdFree,
    license,
    billingEnabled,
    plans,
    formatPrice,
    startCheckout,
    requestRestore,
    openPortal,
  } = useAdFree();
  const [email, setEmail] = useState(license?.email || '');
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function handleCheckout(planId) {
    setBusy(planId);
    setError(null);
    setMessage(null);
    const result = await startCheckout(planId, email);
    if (!result.ok) {
      setError(result.error || t('checkoutUnavailable'));
      setBusy(null);
    }
  }

  async function handleRestore() {
    setBusy('restore');
    setError(null);
    setMessage(null);
    const result = await requestRestore(email);
    if (!result.ok) {
      setError(result.error || t('restoreFailed'));
    } else {
      setMessage(result.message || t('restoreSent'));
    }
    setBusy(null);
  }

  async function handlePortal() {
    setBusy('portal');
    setError(null);
    const result = await openPortal();
    if (!result.ok) {
      setError(result.error || t('portalUnavailable'));
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-heading text-base">{t('title')}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p>
      </div>

      {isAdFree ? (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm">
          <p className="font-medium">{t('activeTitle')}</p>
          <p className="mt-1 text-muted-foreground">
            {t('activeBody', {
              plan: plans[license?.plan]?.label || license?.plan || '—',
              email: license?.email || '—',
            })}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={busy === 'portal' || !billingEnabled}
            onClick={handlePortal}
          >
            {t('manageBilling')}
          </Button>
        </div>
      ) : !billingEnabled ? (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm" role="status">
          <p className="font-medium">{t('unavailableTitle')}</p>
          <p className="mt-1 text-muted-foreground">{t('unavailableBody')}</p>
        </div>
      ) : (
        <>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">{t('emailLabel')}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('emailPlaceholder')}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoComplete="email"
            />
          </label>

          <div className="grid gap-2">
            {ADFEEE_PLAN_IDS.map((planId) => {
              const plan = plans[planId];
              return (
                <button
                  key={planId}
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => handleCheckout(planId)}
                  className={cn(
                    'flex items-center justify-between rounded-xl border border-border/80 bg-card px-4 py-3 text-left transition-colors',
                    'hover:border-foreground/30 hover:bg-muted/30',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                  )}
                >
                  <span>
                    <span className="block text-sm font-medium">{plan.label}</span>
                    <span className="text-xs text-muted-foreground">{formatPrice(plan)}</span>
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {busy === planId ? t('starting') : t('select')}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-border/60 pt-3">
            <p className="text-xs text-muted-foreground">{t('restoreHint')}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 px-0"
              disabled={busy === 'restore' || !email.includes('@')}
              onClick={handleRestore}
            >
              {t('restoreCta')}
            </Button>
          </div>
        </>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
