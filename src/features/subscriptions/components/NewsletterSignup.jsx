'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useClientId } from '@/features/cities/hooks/useClientId';
import { useLocalSubscriptions } from '@/features/subscriptions/hooks/useLocalSubscriptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterSignup() {
  const clientId = useClientId();
  const { registry, recordSubscription, clearNewsletter } = useLocalSubscriptions();
  const [email, setEmail] = useState(registry.email ?? '');

  const isSubscribed = Boolean(registry.newsletter?.active);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!clientId || !email) return;

    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        email,
        type: 'newsletter',
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      toast.error('Unable to save newsletter subscription');
      return;
    }

    recordSubscription(payload.subscription);
    toast.success('Subscribed to meridian updates');
    setEmail('');
  }

  async function handleUnsubscribe() {
    const token = registry.newsletter?.unsubscribeToken;
    if (!token) {
      clearNewsletter();
      return;
    }

    const response = await fetch(`/api/unsubscribe?token=${token}`);
    if (!response.ok) {
      toast.error('Unable to unsubscribe');
      return;
    }

    clearNewsletter();
    toast.message('Unsubscribed from meridian newsletter');
  }

  if (isSubscribed) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">Subscribed to meridian updates.</p>
        <Button variant="outline" size="sm" onClick={handleUnsubscribe}>
          Unsubscribe
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <Input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Button type="submit">Subscribe to meridian</Button>
    </form>
  );
}
