'use client';

import { cn } from '@/lib/utils';

export function PreferenceSelect({ id, label, description, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background/60 p-3">
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
        </label>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-10 w-full rounded-md border border-input bg-background px-3 text-sm',
          'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
