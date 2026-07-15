'use client';

import { Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CityDetailHeroImageButton({ onClick, isChanging = false, disabled = false }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-11 shrink-0"
      onClick={onClick}
      disabled={disabled || isChanging}
      aria-label="Change hero photo"
    >
      <Images className={cn('size-4', isChanging && 'animate-pulse')} aria-hidden />
    </Button>
  );
}
