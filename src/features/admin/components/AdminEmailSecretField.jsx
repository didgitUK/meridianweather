'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminField } from '@/features/admin/components/AdminPanel';

export function AdminEmailSecretField({
  label,
  provider,
  configured,
  source,
  masked,
  views,
  onSaveKey,
  isSaving,
  onRevealed,
  envHint,
}) {
  const [revealedKey, setRevealedKey] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [replacementKey, setReplacementKey] = useState('');

  async function handleReveal() {
    if (isRevealed) {
      setIsRevealed(false);
      setRevealedKey('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/email-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to reveal API key');
      }

      setRevealedKey(payload.key);
      setIsRevealed(true);
      await onRevealed?.();
    } catch (revealError) {
      setError(revealError.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReplacementChange(event) {
    const value = event.target.value;
    setReplacementKey(value);
    onSaveKey(value);
  }

  const displayValue = isRevealed ? revealedKey : masked;
  const sourceLabel =
    source === 'database'
      ? 'Stored in platform settings'
      : source === 'environment'
        ? `Loaded from ${envHint}`
        : 'Not configured';

  return (
    <AdminField
      label={label}
      hint={
        configured
          ? `${sourceLabel}. Reveal actions are logged with a timestamp.`
          : `Uses ${envHint} from env when empty.`
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            readOnly
            type={isRevealed ? 'text' : 'password'}
            value={displayValue}
            placeholder="No key configured"
            className="font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={isRevealed ? 'Hide API key' : 'Reveal API key'}
            disabled={!configured || isLoading}
            onClick={handleReveal}
          >
            {isRevealed ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
          </Button>
        </div>

        <Input
          type="password"
          value={replacementKey}
          placeholder="Enter a new key to replace the current one"
          onChange={handleReplacementChange}
        />

        {isSaving ? <p className="text-xs text-muted-foreground">Saving new key…</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {views?.length ? (
          <div className="rounded-lg border bg-muted/20 px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">Recent key views</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {views.map((entry) => (
                <li key={entry.id}>
                  {new Date(entry.timestamp).toLocaleString('en-GB')}
                  {entry.meta?.source ? ` · ${entry.meta.source}` : ''}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </AdminField>
  );
}
