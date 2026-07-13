'use client';

import { TIERS } from '@/constants/monetization';
import { useConsent } from '@/providers/ConsentProvider';
import { Button } from '@/components/ui/button';

export function PremiumGate({ feature, label, children }) {
  const { tier } = useConsent();

  if (tier === TIERS.PREMIUM) {
    return children;
  }

  return (
    <section className="rounded-xl border border-dashed bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading text-lg">{label ?? feature}</p>
          <p className="text-sm text-muted-foreground">Available with meridian Premium.</p>
        </div>
        <Button variant="outline" size="sm" disabled>
          Upgrade (coming soon)
        </Button>
      </div>
    </section>
  );
}
