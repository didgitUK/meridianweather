'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { BrandLoadingScreen } from '@/features/weather/components/CityDetailLoadingScreen';
import { useAdFree } from '@/providers/AdFreeProvider';

export default function BillingRestoreClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refresh } = useAdFree();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Missing restore token.');
      return;
    }

    let cancelled = false;

    async function confirm() {
      const response = await fetch('/api/billing/restore/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      const payload = await response.json().catch(() => null);
      if (cancelled) {
        return;
      }
      if (!response.ok) {
        setError(payload?.error || 'Unable to restore license.');
        return;
      }
      await refresh();
      router.replace('/');
    }

    void confirm();

    return () => {
      cancelled = true;
    };
  }, [searchParams, refresh, router]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-3 px-page py-16 text-center">
        <h1 className="font-heading text-2xl">Restore issue</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
      </main>
    );
  }

  return <BrandLoadingScreen stageKey="loadingLocation" />;
}
