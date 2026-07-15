'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TOUCH } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function RecentChecksCarouselControls({
  onPrevious,
  onNext,
  disabled = false,
  previousLabel = 'Show previous recent checks',
  nextLabel = 'Show next recent checks',
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={previousLabel}
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
        aria-label={nextLabel}
        onClick={onNext}
        disabled={disabled}
        className={cn(TOUCH.target, 'sm:size-8')}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
