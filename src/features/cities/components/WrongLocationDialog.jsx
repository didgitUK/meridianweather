'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CitySearch } from '@/features/cities/components/CitySearch';

export function WrongLocationDialog({ open, onOpenChange, onSelect }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Set your location</DialogTitle>
          <DialogDescription>
            Search for the place that matches where you are. We will remember it on this device for
            next time.
          </DialogDescription>
        </DialogHeader>

        <CitySearch
          onSelect={onSelect}
          variant="inline"
          actionLabel="Use this location"
          inputId="wrong-location-search"
          autoFocus
        />
      </DialogContent>
    </Dialog>
  );
}
