'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { BrandLoadingScreen } from '@/features/weather/components/CityDetailLoadingScreen';
import { useAdFree } from '@/providers/AdFreeProvider';

export default function BillingSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refresh } = useAdFree();
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('Missing checkout session.');
      return;
    }

    let cancelled = false;

    async function claim() {
      const response = await fetch('/api/billing/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId }),
      });
      const payload = await response.json().catch(() => null);
      if (cancelled) {
        return;
      }
      if (!response.ok) {
        setError(payload?.error || 'Unable to activate ad-free access.');
        return;
      }
      await refresh();
      router.replace('/');
    }

    void claim();

    return () => {
      cancelled = true;
    };
  }, [searchParams, refresh, router]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-3 px-page py-16 text-center">
        <h1 className="font-heading text-2xl">Checkout issue</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
      </main>
    );
  }

  return <BrandLoadingScreen stageKey="preparingForecast" />;
}
