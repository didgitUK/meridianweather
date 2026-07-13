'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CityDetailRefreshButton({ onClick, isRefreshing = false, disabled = false }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-11 shrink-0"
      onClick={onClick}
      disabled={disabled || isRefreshing}
      aria-label="Rerun weather check"
    >
      <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} aria-hidden />
    </Button>
  );
}
