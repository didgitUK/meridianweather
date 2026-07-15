'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useClientId } from '@/features/cities/hooks/useClientId';
import { useLocalSubscriptions } from '@/features/subscriptions/hooks/useLocalSubscriptions';
import {
  getActiveTypesForCity,
  mapTypesToApi,
} from '@/features/subscriptions/utils/subscription-state';
import { clearWeatherCacheForCity } from '@/features/weather/utils/weather-cache';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function RemoveCityDialog({ city, open, onOpenChange, onRemoved }) {
  const t = useTranslations('Subscriptions.removeCity');
  const tCommon = useTranslations('Common');
  const clientId = useClientId();
  const { registry, clearCity } = useLocalSubscriptions();
  const activeTypes = city ? getActiveTypesForCity(registry, city.id) : [];
  const [weekly, setWeekly] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!city) return null;

  async function removeCityOnly() {
    clearWeatherCacheForCity(city.id);
    onRemoved(city.id);
    onOpenChange(false);
    toast.message(tCommon('cityRemoved', { city: city.name }));
  }

  async function removeWithUnsubscribe() {
    setIsSubmitting(true);
    const typesToUnsub = [];
    if (weekly && activeTypes.includes('weekly')) typesToUnsub.push('weekly');
    if (alerts && activeTypes.includes('alerts')) typesToUnsub.push('alerts');

    if (typesToUnsub.length > 0) {
      try {
        const response = await fetch('/api/subscriptions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            cityLat: city.lat,
            cityLon: city.lon,
            types: mapTypesToApi(typesToUnsub),
          }),
        });

        if (!response.ok) throw new Error('Unable to unsubscribe');
        clearCity(city.id, typesToUnsub);
      } catch (error) {
        toast.error(error.message);
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
    await removeCityOnly();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">{t('title', { city: city.name })}</DialogTitle>
          <DialogDescription>
            {activeTypes.length > 0
              ? t('hasSubscriptions')
              : t('noSubscriptions')}
          </DialogDescription>
        </DialogHeader>

        {activeTypes.length > 0 ? (
          <div className="flex flex-col gap-3">
            {activeTypes.includes('weekly') ? (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={weekly} onChange={(e) => setWeekly(e.target.checked)} />
                {t('stopForecasts')}
              </label>
            ) : null}
            {activeTypes.includes('alerts') ? (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={alerts} onChange={(e) => setAlerts(e.target.checked)} />
                {t('stopAlerts')}
              </label>
            ) : null}
          </div>
        ) : null}

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {tCommon('cancel')}
          </Button>
          <Button variant="outline" onClick={removeCityOnly} disabled={isSubmitting}>
            {t('removeOnly')}
          </Button>
          {activeTypes.length > 0 ? (
            <Button onClick={removeWithUnsubscribe} disabled={isSubmitting}>
              {t('removeAndUnsubscribe')}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
