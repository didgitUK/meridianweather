'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TOUCH, SPACING } from '@/constants/design-tokens';
import { CITY_DETAIL_TABS, CITY_DETAIL_TAB_IDS } from '@/constants/city-detail';

const TAB_MESSAGE_KEYS = {
  [CITY_DETAIL_TAB_IDS.today]: 'today',
  [CITY_DETAIL_TAB_IDS.hourly]: 'hourly',
  [CITY_DETAIL_TAB_IDS.daily]: 'daily',
  [CITY_DETAIL_TAB_IDS.history]: 'history',
};

export function CityDetailForecastTabs({ activeTab, onChange }) {
  const t = useTranslations('CityDetail.tabs');

  return (
    <div
      role="tablist"
      aria-label={t('label')}
      className={cn(
        'sticky z-20 border-b border-border/80 bg-background/95 backdrop-blur-md',
        'top-[var(--site-header-sticky-offset,var(--site-header-height,4.5rem))]',
        'transition-[top] duration-300 ease-out',
        /* Full-bleed without relative/transform — those defeat position:sticky. */
        'w-screen max-w-[100vw] ml-[calc(50%-50vw)]',
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-6xl items-stretch gap-1 py-1',
          SPACING.pageX,
        )}
      >
        {CITY_DETAIL_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const messageKey = TAB_MESSAGE_KEYS[tab.id] ?? tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`city-tab-${tab.id}`}
              aria-controls={`city-tabpanel-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={cn(
                'min-w-0 flex-1 rounded-lg px-2 py-2.5 text-center text-sm font-medium transition-colors sm:px-4',
                TOUCH.minH,
                isActive
                  ? 'bg-black text-white hover:bg-black hover:text-white'
                  : 'bg-[#f7f7f7] text-muted-foreground hover:bg-neutral-200 hover:text-foreground dark:bg-muted/60 dark:hover:bg-muted',
              )}
            >
              {t(messageKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
