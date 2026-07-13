'use client';

import { Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CityDetailPinButton({ isPinned, onClick, disabled = false }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-11 shrink-0"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPinned ? 'Remove from locations' : 'Pin to your locations'}
      aria-pressed={isPinned}
    >
      {isPinned ? (
        <PinOff className="size-4" aria-hidden />
      ) : (
        <Pin className="size-4" aria-hidden />
      )}
    </Button>
  );
}
