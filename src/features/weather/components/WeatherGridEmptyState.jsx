'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, Search } from 'lucide-react';
import { CitySearch } from '@/features/cities/components/CitySearch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TOUCH } from '@/constants/design-tokens';

export function WeatherGridEmptyState({ onCheckCity }) {
  const t = useTranslations('Dashboard.locations');
  const tHeader = useTranslations('Header');
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const contentId = useId();
  const inputId = 'city-search-locations';

  return (
    <div
      className={cn(
        'rounded-xl border border-dashed bg-[#f7f7f7] p-8 text-center',
        isSearchOpen && 'relative z-20 overflow-visible',
      )}
    >
      <h3 className="font-heading text-xl">{t('emptyTitle')}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('emptyDescription')}
      </p>

      <div className={cn('relative mx-auto mt-6 max-w-md', isSearchOpen && 'z-30 overflow-visible')}>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className={cn(
            TOUCH.minH,
            'w-full gap-2 bg-white! text-base hover:bg-white!',
            'aria-expanded:bg-white! aria-expanded:hover:bg-white!',
            'dark:bg-white! dark:hover:bg-white! dark:aria-expanded:bg-white!',
          )}
          aria-expanded={isSearchOpen}
          aria-controls={contentId}
          onClick={() => setIsSearchOpen((open) => !open)}
        >
          <Search className="size-4" aria-hidden />
          {t('searchToggle')}
          <ChevronDown
            className={cn('size-4 transition-transform duration-300', isSearchOpen && 'rotate-180')}
            aria-hidden
          />
        </Button>

        <div
          id={contentId}
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-out',
            isSearchOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className={cn('min-h-0', isSearchOpen ? 'overflow-visible' : 'overflow-hidden')}>
            <div
              className={cn(
                'relative pt-4 transition-opacity duration-300',
                '[&_input]:bg-white [&_input]:text-center [&_input]:pr-10 [&_input]:dark:bg-white',
                isSearchOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              <CitySearch
                onSelect={onCheckCity}
                variant="inline"
                inputId={inputId}
                autoFocus={isSearchOpen}
                actionLabel={tHeader('checkAction')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
