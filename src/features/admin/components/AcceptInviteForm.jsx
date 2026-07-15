'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AcceptInviteForm({ token }) {
  const router = useRouter();
  const [invite, setInvite] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`/api/auth/invite/${encodeURIComponent(token)}`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message ?? 'Invite is not valid');
        }
        if (!cancelled) {
          setInvite(payload.invite);
          setDisplayName(payload.invite.displayName ?? '');
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/auth/invite/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, password }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to accept invite');
      }

      router.push('/login');
      router.refresh();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Checking invite…</p>;
  }

  if (!invite) {
    return <p className="text-sm text-destructive">{error || 'Invite is not valid.'}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Creating admin account for <span className="font-medium text-foreground">{invite.email}</span>
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="invite-name" className="text-sm font-medium">
          Display name
        </label>
        <Input
          id="invite-name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="invite-password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="invite-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Accept invite'}
      </Button>
    </form>
  );
}
