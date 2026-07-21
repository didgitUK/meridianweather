'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { countryCodeToFlagEmoji } from '@/features/cities/utils/city-search';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { MOBILE_NAV, TOUCH } from '@/constants/design-tokens';
import { writeLocalStorageValue } from '@/hooks/use-browser-storage';
import {
  filterLocales,
  getLocaleFlagCountry,
  getLocaleLabel,
  locales,
} from '@/i18n/locales';
import { cn } from '@/lib/utils';

function clearClientWeatherCache() {
  try {
    window.localStorage.removeItem(STORAGE_KEYS.weatherCache);
  } catch {
    // Ignore storage failures.
  }
}

function useIsMobileLanguageSheet() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return isMobile;
}

/**
 * Header locale picker — searchable over shipped next-intl locales.
 * Desktop: dropdown. Mobile: full-height sheet above bottom nav.
 */
export function LanguageSwitcher({ className }) {
  const t = useTranslations('Header.language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { syncUnitFromLocale } = useTemperatureUnit();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const listId = useId();
  const searchInputId = useId();
  const isMobileSheet = useIsMobileLanguageSheet();

  const options = useMemo(() => filterLocales(query), [query]);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) {
      return;
    }

    restoredRef.current = true;
    const preferred = window.localStorage.getItem(STORAGE_KEYS.preferredLocale);

    if (preferred && preferred !== locale && locales.includes(preferred)) {
      router.replace(pathname, { locale: preferred });
      return;
    }

    if (!preferred) {
      writeLocalStorageValue(STORAGE_KEYS.preferredLocale, locale);
    }
  }, [locale, pathname, router]);

  useEffect(() => {
    if (!open || isMobileSheet) {
      return undefined;
    }

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery('');
      }
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, isMobileSheet]);

  useEffect(() => {
    if (!open || !isMobileSheet) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      document.getElementById(searchInputId)?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [open, isMobileSheet, searchInputId]);

  function selectLocale(nextLocale) {
    if (!locales.includes(nextLocale)) {
      return;
    }

    writeLocalStorageValue(STORAGE_KEYS.preferredLocale, nextLocale);
    syncUnitFromLocale(nextLocale);
    clearClientWeatherCache();
    setOpen(false);
    setQuery('');

    if (nextLocale === locale) {
      return;
    }

    router.replace(pathname, { locale: nextLocale });
  }

  function handleOpenChange(next) {
    setOpen(next);
    if (!next) {
      setQuery('');
    }
  }

  const currentFlag = countryCodeToFlagEmoji(getLocaleFlagCountry(locale));

  const localeList = (
    <ul className={cn('flex flex-col gap-1 p-1', isMobileSheet ? 'pb-4' : 'max-h-64 overflow-y-auto')}>
      {options.length === 0 ? (
        <li className="px-3 py-6 text-center text-sm text-muted-foreground">
          {t('noMatch')}
        </li>
      ) : (
        options.map((option) => {
          const selected = option === locale;
          return (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-sm transition-colors',
                  TOUCH.minH,
                  selected ? 'bg-muted' : 'hover:bg-muted/70',
                )}
                onClick={() => selectLocale(option)}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {countryCodeToFlagEmoji(getLocaleFlagCountry(option))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">
                    {getLocaleLabel(option)}
                  </span>
                  <span className="block text-xs text-muted-foreground">{option}</span>
                </span>
                {selected ? (
                  <Check className="size-4 shrink-0 text-foreground" aria-hidden />
                ) : null}
              </button>
            </li>
          );
        })
      )}
    </ul>
  );

  const searchField = (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={searchInputId}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('searchPlaceholder')}
        className={cn('pl-8 text-sm', isMobileSheet ? 'h-12 text-base' : 'h-9')}
        aria-label={t('searchLabel')}
        autoFocus={!isMobileSheet}
      />
    </div>
  );

  return (
    <div ref={rootRef} className={cn('relative shrink-0', className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          'h-11 min-h-touch gap-1.5 border-white/20 bg-white/95 text-neutral-950 hover:bg-white dark:bg-white dark:text-neutral-950',
          isMobileSheet ? 'px-2.5' : 'px-2.5',
        )}
        aria-haspopup={isMobileSheet ? 'dialog' : 'listbox'}
        aria-expanded={open}
        aria-controls={isMobileSheet ? undefined : listId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="text-base leading-none" aria-hidden>
          {currentFlag}
        </span>
        <span className="hidden text-xs font-medium uppercase tracking-wide md:inline">
          {locale === 'en-GB' ? 'EN-GB' : locale.toUpperCase()}
        </span>
        <ChevronsUpDown className="hidden size-3.5 opacity-60 md:inline" aria-hidden />
        <span className="sr-only">{t('changeLanguage')}</span>
      </Button>

      {isMobileSheet ? (
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent
            side="bottom"
            className={cn(
              'flex w-full max-w-full flex-col gap-0 rounded-t-2xl p-0',
              MOBILE_NAV.sheetHeight,
              MOBILE_NAV.sheetMaxHeight,
            )}
          >
            <SheetHeader className="shrink-0 border-b border-border/60 px-4 pt-4 pb-3 text-left">
              <SheetTitle className="font-heading text-left">{t('selectLanguage')}</SheetTitle>
              <SheetDescription className="text-left">{t('footerNote')}</SheetDescription>
            </SheetHeader>
            <div className="shrink-0 border-b border-border/60 px-4 py-3">
              {searchField}
            </div>
            <div
              id={listId}
              role="listbox"
              aria-label={t('selectLanguage')}
              className="meridian-scrollbar min-h-0 flex-1 overflow-y-auto px-2"
            >
              {localeList}
            </div>
          </SheetContent>
        </Sheet>
      ) : open ? (
        <div
          id={listId}
          role="listbox"
          aria-label={t('selectLanguage')}
          className="absolute top-[calc(100%+0.4rem)] right-0 z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border/70 bg-card shadow-lg shadow-foreground/10"
        >
          <div className="border-b border-border/60 p-2">{searchField}</div>
          {localeList}
          <p className="border-t border-border/60 px-3 py-2 text-[0.7rem] leading-snug text-muted-foreground">
            {t('footerNote')}
          </p>
        </div>
      ) : null}
    </div>
  );
}
