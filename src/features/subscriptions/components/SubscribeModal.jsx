'use client';

import { Mail } from 'lucide-react';
import { useState } from 'react';
import { useLocalSubscriptions } from '@/features/subscriptions/hooks/useLocalSubscriptions';
import {
  getButtonLabel,
  getCitySubscriptionState,
} from '@/features/subscriptions/utils/subscription-state';
import { SubscribeDialog } from '@/features/subscriptions/components/SubscribeDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TOUCH } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function SubscribeModal({ city }) {
  const { registry } = useLocalSubscriptions();
  const subState = getCitySubscriptionState(registry, city.id);
  const [open, setOpen] = useState(false);
  const label = getButtonLabel(subState);

  return (
    <>
      <Button
        type="button"
        variant={subState.any ? 'secondary' : 'outline'}
        size="sm"
        className={cn(TOUCH.minH, 'flex-wrap gap-2')}
        onClick={() => setOpen(true)}
      >
        <Mail className="size-3.5 shrink-0" aria-hidden />
        {label}
        {subState.weekly ? <Badge variant="outline">Weekly</Badge> : null}
        {subState.alerts ? <Badge variant="outline">Alerts</Badge> : null}
      </Button>
      <SubscribeDialog city={city} open={open} onOpenChange={setOpen} />
    </>
  );
}
