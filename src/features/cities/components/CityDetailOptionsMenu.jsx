'use client';

import { useState } from 'react';
import { ChevronDown, Flag, Mail, Pin, PinOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSavedCities } from '@/features/cities/hooks/useSavedCities';
import { CityDetailOptionsMenuItem } from '@/features/cities/components/CityDetailOptionsMenuItem';
import { CityDetailPinButton } from '@/features/cities/components/CityDetailPinButton';
import { CityDetailRefreshButton } from '@/features/cities/components/CityDetailRefreshButton';
import { SubscribeDialog } from '@/features/subscriptions/components/SubscribeDialog';
import { useLocalSubscriptions } from '@/features/subscriptions/hooks/useLocalSubscriptions';
import { getCitySubscriptionState } from '@/features/subscriptions/utils/subscription-state';
import { useWeatherRefreshMode } from '@/providers/WeatherRefreshModeProvider';

export function CityDetailOptionsMenu({
  city,
  isPinned,
  onRerunCheck,
  isRefreshing = false,
  onReportInaccurate,
  isReportActive = false,
  isReporting = false,
}) {
  const { isManual } = useWeatherRefreshMode();
  const { addCity, removeCity } = useSavedCities();
  const { registry } = useLocalSubscriptions();
  const subState = getCitySubscriptionState(registry, city.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  if (!city) {
    return null;
  }

  function handlePin() {
    addCity(city);
    toast.success('Pinned to your locations');
    setMenuOpen(false);
  }

  function handleUnpin() {
    removeCity(city.id);
    toast.message('Removed from your locations');
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

  return (
    <>
      <div className="flex items-center gap-2">
        {isManual ? (
          <CityDetailRefreshButton
            onClick={handleRerunCheck}
            isRefreshing={isRefreshing}
            disabled={!onRerunCheck}
          />
        ) : null}

        <CityDetailPinButton
          isPinned={isPinned}
          onClick={isPinned ? handleUnpin : handlePin}
        />

        <div
          className="relative"
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
          onFocus={() => setMenuOpen(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setMenuOpen(false);
            }
          }}
        >
        <Button
          type="button"
          variant="outline"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="h-11 min-w-[9.5rem] gap-2 px-4 text-base"
          onClick={() => setMenuOpen((open) => !open)}
        >
          Options
          <ChevronDown
            className={cn('size-4 transition-transform duration-200', menuOpen && 'rotate-180')}
            aria-hidden
          />
        </Button>

        <div
          className={cn(
            'absolute top-full right-0 z-30 w-64 pt-2 transition-all duration-150',
            menuOpen
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-1 opacity-0',
          )}
        >
          <div
            role="menu"
            aria-label="City options"
            inert={!menuOpen}
            className="rounded-xl border border-border/80 bg-popover p-1.5 shadow-lg ring-1 ring-foreground/5"
          >
            {isManual ? (
              <>
                <CityDetailOptionsMenuItem
                  icon={RefreshCw}
                  label="Rerun check"
                  description="Fetch the latest weather for this city"
                  onClick={handleRerunCheck}
                />

                <div className="my-1 border-t border-border/60" role="separator" />
              </>
            ) : null}

            <CityDetailOptionsMenuItem
              icon={Flag}
              label="Report inaccurate"
              description={
                isReportActive
                  ? 'Our team is already reviewing this location'
                  : 'Flag weather or forecast data that looks wrong'
              }
              onClick={handleReportInaccurate}
              className={isReporting ? 'opacity-60' : undefined}
            />

            <div className="my-1 border-t border-border/60" role="separator" />

            {isPinned ? (
              <CityDetailOptionsMenuItem
                icon={PinOff}
                label="Remove from locations"
                description="Unpin this city from your dashboard"
                onClick={handleUnpin}
              />
            ) : (
              <CityDetailOptionsMenuItem
                icon={Pin}
                label="Pin to your locations"
                description="Save this city on your dashboard"
                onClick={handlePin}
              />
            )}

            <div className="my-1 border-t border-border/60" role="separator" />

            <CityDetailOptionsMenuItem
              icon={Mail}
              label="Email options"
              description={
                subState.any
                  ? 'Manage platform-wide forecasts and weather alerts'
                  : 'Get platform-wide forecasts and weather alerts'
              }
              onClick={handleEmailOpen}
            />

            {subState.any ? (
              <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                {subState.weekly ? <Badge variant="outline">Weekly</Badge> : null}
                {subState.alerts ? <Badge variant="outline">Alerts</Badge> : null}
              </div>
            ) : null}
          </div>
        </div>
        </div>
      </div>

      <SubscribeDialog city={city} open={emailOpen} onOpenChange={setEmailOpen} />
    </>
  );
}
