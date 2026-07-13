'use client';

import { useState } from 'react';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      toast.error('Select at least one weather alert, or turn alerts off.');
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

      toast.success(`Subscriptions updated for ${city.name}`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,52rem)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="shrink-0 space-y-1 border-b border-border/60 px-5 py-4 pr-12">
          <DialogTitle className="font-heading text-lg">
            Email updates for {city.name}
          </DialogTitle>
          <DialogDescription>
            Platform-wide forecasts combine your locations into one email (up to{' '}
            {MAX_WEEKLY_DIGEST_LOCATIONS}). Weather alerts stay per city and match the types shown
            in admin.
          </DialogDescription>
        </DialogHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="shrink-0 border-b border-border/60 px-5 py-4">
            <div className="flex max-w-md flex-col gap-2">
              <Label htmlFor={`email-${city.id}`}>Email</Label>
              <Input
                id={`email-${city.id}`}
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[minmax(12rem,0.9fr)_minmax(0,1.6fr)]">
            <section className="flex flex-col gap-3 border-b border-border/60 p-5 md:border-r md:border-b-0">
              <div>
                <h3 className="text-sm font-medium">Platform-wide forecasts</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  One weekly email covering all your subscribed locations — not just {city.name}.
                </p>
              </div>
              <label className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={weekly}
                  disabled={atWeeklyLimit}
                  onChange={(event) => setWeekly(event.target.checked)}
                />
                <span>
                  Include {city.name} in platform-wide forecasts
                  {atWeeklyLimit ? (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Limit of {MAX_WEEKLY_DIGEST_LOCATIONS} locations reached for this email.
                    </span>
                  ) : (
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      Forecast summary for every location on this email.
                    </span>
                  )}
                </span>
              </label>
            </section>

            <section className="flex min-h-0 flex-col p-5 md:max-h-[min(28rem,50vh)]">
              <SubscribeAlertPrefs
                enabled={alerts}
                mode={alertMode}
                prefs={alertPrefs}
                onEnabledChange={setAlerts}
                onModeChange={setAlertMode}
                onPrefsChange={setAlertPrefs}
              />
            </section>
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-border/60 bg-muted/30 px-5 py-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save subscriptions'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
