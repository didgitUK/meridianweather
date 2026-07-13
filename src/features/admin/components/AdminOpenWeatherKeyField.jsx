'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminField } from '@/features/admin/components/AdminPanel';

export function AdminOpenWeatherKeyField({ settings, onSave, isSaving, onRevealed }) {
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
      const response = await fetch('/api/admin/openweather-key', { method: 'POST' });
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
    onSave({ openWeatherApiKey: value });
  }

  const displayValue = isRevealed ? revealedKey : settings.openWeatherApiKeyMasked;
  const sourceLabel =
    settings.openWeatherApiKeySource === 'database'
      ? 'Stored in platform settings'
      : settings.openWeatherApiKeySource === 'environment'
        ? 'Loaded from OPENWEATHER_API_KEY env'
        : 'Not configured';

  return (
    <AdminField
      label="OpenWeather API key"
      hint={
        settings.openWeatherApiKeyConfigured
          ? `${sourceLabel}. Reveal actions are logged with a timestamp.`
          : 'Uses OPENWEATHER_API_KEY from env when empty.'
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
            disabled={!settings.openWeatherApiKeyConfigured || isLoading}
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

        {settings.openWeatherApiKeyViews?.length ? (
          <div className="rounded-lg border bg-muted/20 px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">Recent key views</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {settings.openWeatherApiKeyViews.map((entry) => (
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
