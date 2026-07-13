'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TOUCH } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function RecentChecksCarouselControls({
  onPrevious,
  onNext,
  disabled = false,
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Show previous recent checks"
        onClick={onPrevious}
        disabled={disabled}
        className={cn(TOUCH.target, 'sm:size-8')}
      >
        <ChevronLeft />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Show next recent checks"
        onClick={onNext}
        disabled={disabled}
        className={cn(TOUCH.target, 'sm:size-8')}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
