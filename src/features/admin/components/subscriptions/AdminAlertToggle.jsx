'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminAlertToggle({
  label,
  enabled,
  disabled = false,
  onToggle,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={enabled}
      aria-label={`${label}: ${enabled ? 'on' : 'off'}. Click to ${enabled ? 'turn off' : 'turn on'}.`}
      onClick={onToggle}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md border transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        enabled
          ? 'border-emerald-600/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400'
          : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60',
      )}
    >
      {enabled ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
    </button>
  );
}
