'use client';

import { Badge } from '@/components/ui/badge';
import { TIERS } from '@/constants/monetization';
import { useConsent } from '@/providers/ConsentProvider';

export function PremiumBadge() {
  const { tier } = useConsent();
  if (tier !== TIERS.PREMIUM) return null;
  return <Badge variant="secondary">Premium</Badge>;
}
