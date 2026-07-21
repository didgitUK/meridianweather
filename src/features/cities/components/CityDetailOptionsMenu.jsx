'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ChevronDown,
  Flag,
  Images,
  Mail,
  MoreVertical,
  Pin,
  PinOff,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useSavedCities } from '@/features/cities/hooks/useSavedCities';
import { CityDetailOptionsMenuItem } from '@/features/cities/components/CityDetailOptionsMenuItem';
import { CityDetailPinButton } from '@/features/cities/components/CityDetailPinButton';
import { CityDetailHeroImageButton } from '@/features/cities/components/CityDetailHeroImageButton';
import { SubscribeDialog } from '@/features/subscriptions/components/SubscribeDialog';
import { useLocalSubscriptions } from '@/features/subscriptions/hooks/useLocalSubscriptions';
import { getCitySubscriptionState } from '@/features/subscriptions/utils/subscription-state';
import { useWeatherRefreshMode } from '@/providers/WeatherRefreshModeProvider';

function usePreferHoverMenus() {
  const [preferHover, setPreferHover] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setPreferHover(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return preferHover;
}

export function CityDetailOptionsMenu({
  city,
  isPinned,
  onRerunCheck,
  isRefreshing = false,
  onChangeHeroImage,
  isChangingHeroImage = false,
  onReportInaccurate,
  isReportActive = false,
  isReporting = false,
}) {
  const t = useTranslations('CityDetail.options');
  const tCommon = useTranslations('Common');
  const tSubs = useTranslations('Subscriptions');
  const { isManual } = useWeatherRefreshMode();
  const { addCity, removeCity } = useSavedCities();
  const { registry } = useLocalSubscriptions();
  const subState = getCitySubscriptionState(registry, city.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const preferHover = usePreferHoverMenus();
  const rootRef = useRef(null);
  const usePopup = !preferHover;

  useEffect(() => {
    if (!menuOpen || usePopup || preferHover) {
      return undefined;
    }

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen, preferHover, usePopup]);

  if (!city) {
    return null;
  }

  function handlePin() {
    addCity(city);
    toast.success(tCommon('pinned'));
    setMenuOpen(false);
  }

  function handleUnpin() {
    removeCity(city.id);
    toast.message(tCommon('unpinned'));
    setMenuOpen(false);
  }

  function handleEmailOpen() {
    setMenuOpen(false);
    setEmailOpen(true);
  }

  function handleRerunCheck() {
    onRerunCheck?.();
    setMenuOpen(false);
  }

  async function handleReportInaccurate() {
    setMenuOpen(false);
    await onReportInaccurate?.();
  }

  function handleChangeHeroImage() {
    setMenuOpen(false);
    onChangeHeroImage?.();
  }

  const menuItems = (
    <>
      <CityDetailOptionsMenuItem
        icon={Images}
        label={t('changeHeroImage')}
        description={t('changeHeroImageDescription')}
        onClick={handleChangeHeroImage}
        disabled={!onChangeHeroImage || isChangingHeroImage}
      />
      <div className="my-1 border-t border-border/60" role="separator" />
      {isPinned ? (
        <CityDetailOptionsMenuItem
          icon={PinOff}
          label={t('removeFromLocations')}
          description={t('removeFromLocationsDescription')}
          onClick={handleUnpin}
        />
      ) : (
        <CityDetailOptionsMenuItem
          icon={Pin}
          label={t('pinToLocations')}
          description={t('pinToLocationsDescription')}
          onClick={handlePin}
        />
      )}
      <div className="my-1 border-t border-border/60" role="separator" />

      {isManual ? (
        <>
          <CityDetailOptionsMenuItem
            icon={RefreshCw}
            label={t('rerunCheck')}
            description={t('rerunCheckDescription')}
            onClick={handleRerunCheck}
            disabled={!onRerunCheck || isRefreshing}
          />
          <div className="my-1 border-t border-border/60" role="separator" />
        </>
      ) : null}

      <CityDetailOptionsMenuItem
        icon={Flag}
        label={t('reportInaccurate')}
        description={
          isReportActive
            ? t('reportInaccurateActive')
            : t('reportInaccurateDescription')
        }
        onClick={handleReportInaccurate}
        className={isReporting ? 'opacity-60' : undefined}
      />

      <div className="my-1 border-t border-border/60" role="separator" />

      <CityDetailOptionsMenuItem
        icon={Mail}
        label={t('emailOptions')}
        description={
          subState.any
            ? t('emailOptionsManage')
            : t('emailOptionsGet')
        }
        onClick={handleEmailOpen}
      />

      {subState.any ? (
        <div className="flex flex-wrap gap-1.5 px-3 pb-2">
          {subState.weekly ? <Badge variant="outline">{tSubs('forecastsOn')}</Badge> : null}
          {subState.alerts ? <Badge variant="outline">{tSubs('alertsOn')}</Badge> : null}
        </div>
      ) : null}
    </>
  );

  const desktopMenuPanel = (
    <div
      className={cn(
        'absolute top-full right-0 z-50 w-[min(16rem,calc(100vw-2rem))] pt-2 transition-all duration-150',
        menuOpen
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-1 opacity-0',
      )}
    >
      <div
        role="menu"
        aria-label={t('menuLabel')}
        inert={!menuOpen}
        className="rounded-xl border border-border/80 bg-white p-1.5 text-foreground shadow-lg ring-1 ring-foreground/5 dark:bg-popover"
      >
        {/* Desktop: pin remains in the menu as well as the standalone button */}
        <div className="hidden md:block">
          {isPinned ? (
            <CityDetailOptionsMenuItem
              icon={PinOff}
              label={t('removeFromLocations')}
              description={t('removeFromLocationsDescription')}
              onClick={handleUnpin}
            />
          ) : (
            <CityDetailOptionsMenuItem
              icon={Pin}
              label={t('pinToLocations')}
              description={t('pinToLocationsDescription')}
              onClick={handlePin}
            />
          )}
          <div className="my-1 border-t border-border/60" role="separator" />
        </div>

        {isManual ? (
          <>
            <CityDetailOptionsMenuItem
              icon={RefreshCw}
              label={t('rerunCheck')}
              description={t('rerunCheckDescription')}
              onClick={handleRerunCheck}
              disabled={!onRerunCheck || isRefreshing}
            />
            <div className="my-1 border-t border-border/60" role="separator" />
          </>
        ) : null}

        <CityDetailOptionsMenuItem
          icon={Flag}
          label={t('reportInaccurate')}
          description={
            isReportActive
              ? t('reportInaccurateActive')
              : t('reportInaccurateDescription')
          }
          onClick={handleReportInaccurate}
          className={isReporting ? 'opacity-60' : undefined}
        />

        <div className="my-1 border-t border-border/60" role="separator" />

        <CityDetailOptionsMenuItem
          icon={Mail}
          label={t('emailOptions')}
          description={
            subState.any
              ? t('emailOptionsManage')
              : t('emailOptionsGet')
          }
          onClick={handleEmailOpen}
        />

        {subState.any ? (
          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {subState.weekly ? <Badge variant="outline">{tSubs('forecastsOn')}</Badge> : null}
            {subState.alerts ? <Badge variant="outline">{tSubs('alertsOn')}</Badge> : null}
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex w-full items-center gap-2 sm:w-auto">
        {/* Standalone icon buttons from md+ only — avoids cramped mobile hero */}
        <div className="hidden items-center gap-2 md:flex">
          <CityDetailHeroImageButton
            onClick={onChangeHeroImage}
            isChanging={isChangingHeroImage}
            disabled={!onChangeHeroImage}
          />
          <CityDetailPinButton
            isPinned={isPinned}
            onClick={isPinned ? handleUnpin : handlePin}
          />
        </div>

        {usePopup ? (
          <>
            <Button
              type="button"
              variant="outline"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              className="h-11 w-full justify-center gap-2 px-4 text-base sm:w-auto sm:min-w-[9.5rem]"
              onClick={() => setMenuOpen(true)}
            >
              <MoreVertical className="size-4" aria-hidden />
              <span>{t('menu')}</span>
            </Button>
            <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
              <DialogContent className="max-w-sm gap-2 p-3 sm:max-w-sm" showCloseButton>
                <DialogHeader className="px-1 pb-1 pt-1">
                  <DialogTitle>{t('menuLabel')}</DialogTitle>
                </DialogHeader>
                <div role="menu" aria-label={t('menuLabel')} className="flex flex-col">
                  {menuItems}
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div
            ref={rootRef}
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <Button
              type="button"
              variant="outline"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={t('menu')}
              className="h-11 min-w-[9.5rem] justify-start gap-2 px-4 text-base"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span>{t('menu')}</span>
              <ChevronDown
                className={cn(
                  'size-4 transition-transform duration-200',
                  menuOpen && 'rotate-180',
                )}
                aria-hidden
              />
            </Button>

            {desktopMenuPanel}
          </div>
        )}
      </div>

      <SubscribeDialog city={city} open={emailOpen} onOpenChange={setEmailOpen} />
    </>
  );
}
