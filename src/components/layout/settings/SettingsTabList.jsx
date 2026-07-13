'use client';

import { cn } from '@/lib/utils';
import { TOUCH } from '@/constants/design-tokens';

const SETTINGS_TABS = [
  { id: 'cookies', label: 'Cookie preferences' },
  { id: 'weather', label: 'Weather' },
  { id: 'accessibility', label: 'Accessibility' },
];

export function SettingsTabList({ value, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Settings sections"
      className="flex w-full rounded-lg border border-border/80 bg-muted/30 p-1"
    >
      {SETTINGS_TABS.map((tab) => {
        const isActive = tab.id === value;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`settings-panel-${tab.id}`}
            id={`settings-tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex flex-1 items-center justify-center rounded-md px-2 py-2.5 text-center text-xs font-medium leading-tight transition-colors sm:px-3 sm:text-sm',
              TOUCH.minH,
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export { SETTINGS_TABS };
