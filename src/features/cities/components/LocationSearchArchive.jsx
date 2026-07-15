'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { Search } from 'lucide-react';
import { PageSection } from '@/components/layout/PageSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { LocationSearchResultCard } from '@/features/cities/components/LocationSearchResultCard';
import { useCheckCityNavigation } from '@/features/cities/hooks/useCheckCityNavigation';
import { buildGeocodeUrl } from '@/features/cities/hooks/useCitySearch';
import { useSearchResultPreview } from '@/features/cities/hooks/useSearchResultPreview';
import { useUserLocationProfile } from '@/features/cities/hooks/useUserLocationProfile';
import { buildSearchResultKey } from '@/features/cities/utils/city-search';
import { fetchJson } from '@/lib/client/fetch-json';
import { SPACING, TOUCH, TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function LocationSearchArchive() {
  const t = useTranslations('Search.archive');
  const tCommon = useTranslations('Common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q')?.trim() ?? '';
  const [draft, setDraft] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { geocodeContext } = useUserLocationProfile();
  const { previews, loadPreview } = useSearchResultPreview();
  const onSelect = useCheckCityNavigation();

  useEffect(() => {
    const next = searchParams.get('q')?.trim() ?? '';
    setDraft(next);
    setQuery(next);
  }, [searchParams]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsLoading(false);
      setError(query.length > 0 ? t('minChars') : '');
      return undefined;
    }

    let cancelled = false;

    async function runSearch() {
      setIsLoading(true);
      setError('');

      try {
        const payload = await fetchJson(buildGeocodeUrl(query, geocodeContext));
        if (!cancelled) {
          setResults(payload.results ?? []);
        }
      } catch (searchError) {
        if (!cancelled) {
          setError(searchError.message);
          setResults([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void runSearch();
    return () => {
      cancelled = true;
    };
  }, [query, geocodeContext, t]);

  useEffect(() => {
    results.slice(0, 8).forEach((result) => {
      void loadPreview(result);
    });
  }, [results, loadPreview]);

  function submitArchiveSearch(event) {
    event.preventDefault();
    const next = draft.trim();
    const params = new URLSearchParams();
    if (next) params.set('q', next);
    router.push(`/search${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <PageSection>
      <div className={cn('flex flex-col', SPACING.stack6)}>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="underline-offset-4 hover:underline">
              {tCommon('backToDashboard')}
            </Link>
          </p>
          <h1 className={cn(TYPOGRAPHY.displaySm, TYPOGRAPHY.heading)}>{t('title')}</h1>
          <p className={TYPOGRAPHY.muted}>{t('description')}</p>
        </div>

        <form onSubmit={submitArchiveSearch} className="relative max-w-xl">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t('placeholder')}
            aria-label={t('ariaLabel')}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className={cn(TOUCH.minH, 'pr-[5.5rem] pl-10')}
          />
          <Button
            type="submit"
            size="sm"
            className="absolute top-1/2 right-1.5 h-8 -translate-y-1/2 px-3"
          >
            {tCommon('search')}
          </Button>
        </form>

        {query ? (
          <p className="text-sm text-muted-foreground">{t('resultsFor', { query })}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{t('hintWithQuery')}</p>
        )}

        {isLoading ? (
          <ul className="flex flex-col gap-4" aria-busy="true" aria-label={tCommon('loading')}>
            {Array.from({ length: 4 }).map((_, index) => (
              <li
                key={index}
                className="overflow-hidden rounded-xl border border-border/80 bg-card sm:flex"
              >
                <Skeleton className="aspect-[16/10] w-full rounded-none sm:aspect-auto sm:h-36 sm:w-52" />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-3 w-44" />
                  <Skeleton className="mt-2 h-8 w-24" />
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {!isLoading && error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {!isLoading && !error && query.length >= 2 && results.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noMatches')}</p>
        ) : null}

        {!isLoading && results.length > 0 ? (
          <ul className="flex flex-col gap-4" aria-label={t('resultsLabel')}>
            {results.map((result) => {
              const key = buildSearchResultKey(result);
              return (
                <li key={key}>
                  <LocationSearchResultCard
                    result={result}
                    preview={previews[key]}
                    userContext={geocodeContext}
                    onSelect={onSelect}
                    actionLabel={t('openAction')}
                    mapAlt={t('mapAlt', { name: result.name })}
                  />
                </li>
              );
            })}
          </ul>
        ) : null}

        <p className="text-xs text-muted-foreground">{t('osmAttribution')}</p>
      </div>
    </PageSection>
  );
}
