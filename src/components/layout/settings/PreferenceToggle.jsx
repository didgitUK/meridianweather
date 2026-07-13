'use client';

import { cn } from '@/lib/utils';

export function PreferenceToggle({ id, label, description, checked, disabled = false, onCheckedChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/70 bg-background/60 p-3">
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
        </label>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className={cn(
          'mt-0.5 size-5 shrink-0 accent-primary sm:size-4',
          '-m-2 p-2 sm:m-0 sm:p-0',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      />
    </div>
  );
}
