'use client';

import { cn } from '@/lib/utils';
import { TOUCH } from '@/constants/design-tokens';

const CHECKS_LOG_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'checks', label: 'All checks' },
  { id: 'locations', label: 'Locations' },
];

export function ChecksLogTabList({ value, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Checks log sections"
      className="flex w-full rounded-lg border border-border/80 bg-muted/30 p-1"
    >
      {CHECKS_LOG_TABS.map((tab) => {
        const isActive = tab.id === value;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`checks-log-panel-${tab.id}`}
            id={`checks-log-tab-${tab.id}`}
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

export { CHECKS_LOG_TABS };
