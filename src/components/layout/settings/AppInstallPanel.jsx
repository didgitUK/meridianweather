'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PWA_NOTIFY_MODES, normalizePwaNotifyMode } from '@/constants/pwa';
import { useClientId } from '@/features/cities/hooks/useClientId';
import { useSavedCities } from '@/features/cities/hooks/useSavedCities';
import { buildPriorityCities } from '@/features/pwa/priority-cities-store';
import {
  getPushSubscriptionState,
  readStoredNotifyMode,
  subscribeToPush,
  syncPushCities,
  unsubscribeFromPush,
  writeStoredNotifyMode,
} from '@/features/pwa/push-client';
import { usePwaInstallPrompt } from '@/features/pwa/usePwaInstallPrompt';
import { isFunctionalConsentGranted } from '@/lib/consent-storage';

const NOTIFY_OPTIONS = [
  PWA_NOTIFY_MODES.daily,
  PWA_NOTIFY_MODES.severe,
  PWA_NOTIFY_MODES.both,
];

export function AppInstallPanel() {
  const t = useTranslations('Settings.app');
  const clientId = useClientId();
  const { savedCities } = useSavedCities();
  const { canPromptInstall, showIosHint, isInstalled, promptInstall } = usePwaInstallPrompt();
  const [pushState, setPushState] = useState({
    supported: false,
    subscribed: false,
    permission: 'default',
    notifyMode: PWA_NOTIFY_MODES.daily,
  });
  const [notifyMode, setNotifyMode] = useState(PWA_NOTIFY_MODES.daily);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getPushSubscriptionState()
      .then((next) => {
        if (!cancelled) {
          setPushState(next);
          setNotifyMode(normalizePwaNotifyMode(next.notifyMode ?? readStoredNotifyMode()));
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshPushState() {
    const next = await getPushSubscriptionState();
    setPushState(next);
    setNotifyMode(normalizePwaNotifyMode(next.notifyMode ?? readStoredNotifyMode()));
  }

  async function handleInstall() {
    const result = await promptInstall();
    if (result.outcome === 'accepted') {
      toast.success(t('installAccepted'));
    }
  }

  async function handleNotifyModeChange(nextMode) {
    const mode = normalizePwaNotifyMode(nextMode);
    setNotifyMode(mode);
    writeStoredNotifyMode(mode);

    if (!pushState.subscribed || !clientId) {
      return;
    }

    setBusy(true);
    try {
      await syncPushCities({
        clientId,
        cities: buildPriorityCities({ savedCities }),
        notifyMode: mode,
      });
      toast.success(t('notifyModeSaved'));
      await refreshPushState();
    } catch (error) {
      toast.error(error?.message || t('pushFailed'));
    } finally {
      setBusy(false);
    }
  }

  async function handleEnablePush() {
    if (!isFunctionalConsentGranted()) {
      toast.message(t('needFunctionalConsent'));
      return;
    }

    setBusy(true);
    try {
      await subscribeToPush({
        clientId,
        cities: buildPriorityCities({ savedCities }),
        notifyMode,
      });
      toast.success(t('pushEnabled'));
      await refreshPushState();
    } catch (error) {
      toast.error(error?.message || t('pushFailed'));
    } finally {
      setBusy(false);
    }
  }

  async function handleDisablePush() {
    setBusy(true);
    try {
      await unsubscribeFromPush();
      toast.success(t('pushDisabled'));
      await refreshPushState();
    } catch (error) {
      toast.error(error?.message || t('pushFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">{t('installTitle')}</h3>
        <p className="text-sm text-muted-foreground">{t('installDescription')}</p>
        {isInstalled ? (
          <p className="text-sm text-foreground">{t('alreadyInstalled')}</p>
        ) : null}
        {canPromptInstall ? (
          <Button type="button" className="w-full sm:w-auto" onClick={handleInstall}>
            {t('installCta')}
          </Button>
        ) : null}
        {showIosHint ? (
          <p className="rounded-md border border-border/80 bg-muted/30 p-3 text-sm text-muted-foreground">
            {t('iosHint')}
          </p>
        ) : null}
        {!isInstalled && !canPromptInstall && !showIosHint ? (
          <p className="text-sm text-muted-foreground">{t('installUnavailable')}</p>
        ) : null}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">{t('offlineTitle')}</h3>
        <p className="text-sm text-muted-foreground">{t('offlineDescription')}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">{t('pushTitle')}</h3>
        <p className="text-sm text-muted-foreground">{t('pushDescription')}</p>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('notifyModeLegend')}
          </legend>
          {NOTIFY_OPTIONS.map((mode) => (
            <label key={mode} className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="radio"
                name="pwa-notify-mode"
                className="mt-1"
                checked={notifyMode === mode}
                disabled={busy}
                onChange={() => {
                  void handleNotifyModeChange(mode);
                }}
              />
              <span>
                <span className="font-medium text-foreground">{t(`notifyMode.${mode}.label`)}</span>
                <span className="mt-0.5 block text-muted-foreground">
                  {t(`notifyMode.${mode}.description`)}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        {!pushState.supported ? (
          <p className="text-sm text-muted-foreground">{t('pushUnsupported')}</p>
        ) : pushState.subscribed ? (
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={handleDisablePush}
          >
            {t('pushDisableCta')}
          </Button>
        ) : (
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={handleEnablePush}
          >
            {t('pushEnableCta')}
          </Button>
        )}
      </section>
    </div>
  );
}
