'use client';

import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TOUCH } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function SettingsFab({ onOpen, className }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Open settings"
      aria-haspopup="dialog"
      onClick={onOpen}
      className={cn(
        'rounded-full border-border shadow-lg',
        'bg-white hover:bg-white active:bg-white',
        'dark:bg-[var(--color-background)] dark:hover:bg-[var(--color-background)] dark:active:bg-[var(--color-background)]',
        TOUCH.target,
        'focus-visible:ring-3 focus-visible:ring-ring/50',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
    >
      <Settings aria-hidden />
    </Button>
  );
}
