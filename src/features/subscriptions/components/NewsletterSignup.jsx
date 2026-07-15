'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useClientId } from '@/features/cities/hooks/useClientId';
import { useLocalSubscriptions } from '@/features/subscriptions/hooks/useLocalSubscriptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterSignup() {
  const t = useTranslations('Subscriptions.newsletter');
  const tCommon = useTranslations('Common');
  const tErrors = useTranslations('Errors');
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
      toast.error(tErrors('newsletterSaveFailed'));
      return;
    }

    recordSubscription(payload.subscription);
    toast.success(tCommon('newsletterSubscribed'));
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
      toast.error(tErrors('newsletterUnsubscribeFailed'));
      return;
    }

    clearNewsletter();
    toast.message(tCommon('newsletterUnsubscribed'));
  }

  if (isSubscribed) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">{t('subscribed')}</p>
        <Button variant="outline" size="sm" onClick={handleUnsubscribe}>
          {t('unsubscribe')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <Input
        type="email"
        required
        placeholder={t('placeholder')}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Button type="submit">{t('subscribe')}</Button>
    </form>
  );
}
