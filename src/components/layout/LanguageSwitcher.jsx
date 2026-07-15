'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { countryCodeToFlagEmoji } from '@/features/cities/utils/city-search';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { STORAGE_KEYS } from '@/constants/storage-keys';
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

/**
 * Header locale picker — searchable over shipped next-intl locales.
 * Browser Accept-Language is handled by next-intl middleware; this stores an
 * explicit preference and syncs °C/°F to the locale’s regional default.
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
    if (!open) {
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
  }, [open]);

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

  const currentFlag = countryCodeToFlagEmoji(getLocaleFlagCountry(locale));

  return (
    <div ref={rootRef} className={cn('relative shrink-0', className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-11 min-h-touch gap-1.5 border-white/20 bg-white/95 px-2.5 text-neutral-950 hover:bg-white dark:bg-white dark:text-neutral-950"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="text-base leading-none" aria-hidden>
          {currentFlag}
        </span>
        <span className="hidden text-xs font-medium uppercase tracking-wide sm:inline">
          {locale === 'en-GB' ? 'EN-GB' : locale.toUpperCase()}
        </span>
        <ChevronsUpDown className="size-3.5 opacity-60" aria-hidden />
        <span className="sr-only">{t('changeLanguage')}</span>
      </Button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-label={t('selectLanguage')}
          className="absolute top-[calc(100%+0.4rem)] right-0 z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border/70 bg-card shadow-lg shadow-foreground/10"
        >
          <div className="border-b border-border/60 p-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className="h-9 pl-8 text-sm"
                aria-label={t('searchLabel')}
                autoFocus
              />
            </div>
          </div>

          <ul className="max-h-64 overflow-y-auto p-1">
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
                        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
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

          <p className="border-t border-border/60 px-3 py-2 text-[0.7rem] leading-snug text-muted-foreground">
            {t('footerNote')}
          </p>
        </div>
      ) : null}
    </div>
  );
}
