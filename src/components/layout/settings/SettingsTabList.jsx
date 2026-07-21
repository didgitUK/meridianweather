'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TOUCH } from '@/constants/design-tokens';

const SETTINGS_TAB_IDS = ['cookies', 'accessibility', 'adFree'];

export function SettingsTabList({ value, onChange }) {
  const t = useTranslations('Settings.tabs');

  return (
    <div
      role="tablist"
      aria-label={t('label')}
      className="flex w-full rounded-lg border border-border/80 bg-muted/30 p-1"
    >
      {SETTINGS_TAB_IDS.map((id) => {
        const isActive = id === value;

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`settings-panel-${id}`}
            id={`settings-tab-${id}`}
            onClick={() => onChange(id)}
            className={cn(
              'flex flex-1 items-center justify-center rounded-md px-2 py-2.5 text-center text-xs font-medium leading-tight transition-colors sm:px-3 sm:text-sm',
              TOUCH.minH,
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t(id)}
          </button>
        );
      })}
    </div>
  );
}

export const SETTINGS_TABS = SETTINGS_TAB_IDS.map((id) => ({ id, labelKey: id }));
