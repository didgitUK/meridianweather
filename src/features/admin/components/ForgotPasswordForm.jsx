'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setStatus('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to request reset');
      }
      setStatus(payload.message ?? 'If an account exists for that email, a reset link has been sent.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="forgot-email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send reset link'}
      </Button>

      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="underline underline-offset-2 hover:text-foreground">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
