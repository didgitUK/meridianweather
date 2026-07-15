'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  areAllAlertPrefsEnabled,
  createAllAlertPrefs,
  hasAnyAlertPrefEnabled,
} from '@/constants/alert-types';
import { MAX_WEEKLY_DIGEST_LOCATIONS } from '@/constants/subscriptions';
import { useClientId } from '@/features/cities/hooks/useClientId';
import { useLocalSubscriptions } from '@/features/subscriptions/hooks/useLocalSubscriptions';
import {
  ALERT_PREF_MODES,
  SubscribeAlertPrefs,
  buildInitialAlertPrefs,
} from '@/features/subscriptions/components/SubscribeAlertPrefs';
import {
  getCitySubscriptionState,
  SUBSCRIPTION_TYPES,
} from '@/features/subscriptions/utils/subscription-state';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

function countActiveWeeklyDigests(registry) {
  return Object.values(registry.cities ?? {}).filter((city) => city?.weekly?.active).length;
}

function resolveAlertPrefsForSave(mode, prefs) {
  if (mode === ALERT_PREF_MODES.all) {
    return createAllAlertPrefs();
  }
  return prefs;
}

export function SubscribeDialog({ city, open, onOpenChange }) {
  const t = useTranslations('Subscriptions.dialog');
  const tCommon = useTranslations('Common');
  const clientId = useClientId();
  const { registry, recordSubscription, clearCity } = useLocalSubscriptions();
  const subState = getCitySubscriptionState(registry, city.id);
  const existingAlertPrefs = registry.cities?.[city.id]?.alerts?.alertPrefs;
  const weeklyDigestCount = countActiveWeeklyDigests(registry);
  const atWeeklyLimit =
    !subState.weekly && weeklyDigestCount >= MAX_WEEKLY_DIGEST_LOCATIONS;
  const [email, setEmail] = useState(registry.email ?? '');
  const [weekly, setWeekly] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [alertMode, setAlertMode] = useState(ALERT_PREF_MODES.all);
  const [alertPrefs, setAlertPrefs] = useState(() => createAllAlertPrefs());
  const [isSaving, setIsSaving] = useState(false);

  function handleOpenChange(nextOpen) {
    if (nextOpen) {
      const nextPrefs = buildInitialAlertPrefs(
        subState.alerts ? existingAlertPrefs : createAllAlertPrefs(),
      );
      setEmail(registry.email ?? '');
      setWeekly(subState.weekly || (!subState.any && !atWeeklyLimit));
      setAlerts(subState.alerts || !subState.any);
      setAlertPrefs(nextPrefs);
      setAlertMode(
        subState.alerts && !areAllAlertPrefsEnabled(nextPrefs)
          ? ALERT_PREF_MODES.custom
          : ALERT_PREF_MODES.all,
      );
    }
    onOpenChange(nextOpen);
  }

  async function unsubscribeType(type) {
    const response = await fetch('/api/subscriptions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        cityLat: city.lat,
        cityLon: city.lon,
        types: [SUBSCRIPTION_TYPES[type]],
      }),
    });

    if (!response.ok) throw new Error('Unable to unsubscribe');
    clearCity(city.id, [type]);
  }

  async function subscribeType(type, body) {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message ?? 'Unable to subscribe');
    recordSubscription(payload.subscription, city.id);
  }

  async function updateAlertPrefs(prefs) {
    const subscriptionId = registry.cities?.[city.id]?.alerts?.subscriptionId;
    if (!subscriptionId) {
      await unsubscribeType('alerts');
      await subscribeType('alerts', {
        clientId,
        email,
        type: 'city_alerts',
        cityName: city.name,
        cityLat: city.lat,
        cityLon: city.lon,
        alertOnRain: Boolean(prefs.rain),
        alertOnStorm: Boolean(prefs.thunderstorm),
        alertPrefs: prefs,
      });
      return;
    }

    const response = await fetch('/api/subscriptions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        id: subscriptionId,
        alertPrefs: prefs,
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message ?? 'Unable to update alerts');

    if (payload.removed) {
      clearCity(city.id, ['alerts']);
      return;
    }

    recordSubscription(payload.subscription, city.id);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!clientId || !email) return;

    const nextAlertPrefs = resolveAlertPrefsForSave(alertMode, alertPrefs);
    if (alerts && !hasAnyAlertPrefEnabled(nextAlertPrefs)) {
      toast.error(tCommon('selectAtLeastOneAlert'));
      return;
    }

    setIsSaving(true);
    try {
      if (subState.weekly && !weekly) await unsubscribeType('weekly');
      if (subState.alerts && !alerts) await unsubscribeType('alerts');

      if (weekly && !subState.weekly) {
        await subscribeType('weekly', {
          clientId,
          email,
          type: 'city_weekly',
          cityName: city.name,
          cityLat: city.lat,
          cityLon: city.lon,
          frequency: 'weekly',
        });
      }

      if (alerts && !subState.alerts) {
        await subscribeType('alerts', {
          clientId,
          email,
          type: 'city_alerts',
          cityName: city.name,
          cityLat: city.lat,
          cityLon: city.lon,
          alertOnRain: Boolean(nextAlertPrefs.rain),
          alertOnStorm: Boolean(nextAlertPrefs.thunderstorm),
          alertPrefs: nextAlertPrefs,
        });
      } else if (alerts && subState.alerts) {
        await updateAlertPrefs(nextAlertPrefs);
      }

      toast.success(tCommon('subscriptionsUpdated', { city: city.name }));
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  const emailId = `email-${city.id}`;
  const weeklyId = `weekly-${city.id}`;
  const alertsId = `alerts-${city.id}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,40rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 space-y-1.5 px-4 pb-0 pt-4 pr-12">
          <DialogTitle className="font-heading text-lg">
            {t('title', { city: city.name })}
          </DialogTitle>
          <DialogDescription>
            {t('description', { limit: MAX_WEEKLY_DIGEST_LOCATIONS })}
          </DialogDescription>
        </DialogHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={emailId}>{t('emailLabel')}</Label>
              <Input
                id={emailId}
                type="email"
                required
                autoComplete="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <PreferenceRow
                id={weeklyId}
                title={t('weeklyTitle')}
                description={
                  atWeeklyLimit
                    ? t('weeklyLimitHint', { limit: MAX_WEEKLY_DIGEST_LOCATIONS })
                    : t('weeklyHint', { city: city.name })
                }
                checked={weekly}
                disabled={atWeeklyLimit}
                onCheckedChange={setWeekly}
              />

              <PreferenceRow
                id={alertsId}
                title={t('alertsTitle')}
                description={t('alertsHint')}
                checked={alerts}
                onCheckedChange={setAlerts}
              />
            </div>

            {alerts ? (
              <SubscribeAlertPrefs
                mode={alertMode}
                prefs={alertPrefs}
                onModeChange={setAlertMode}
                onPrefsChange={setAlertPrefs}
              />
            ) : null}
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? tCommon('loading') : t('saveSubscriptions')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PreferenceRow({
  id,
  title,
  description,
  checked,
  disabled = false,
  onCheckedChange,
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/15 px-3 py-3">
      <div className="min-w-0 flex-1 space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium leading-snug">
          {title}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="mt-0.5"
      />
    </div>
  );
}
