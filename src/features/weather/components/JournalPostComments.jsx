'use client';

import { useEffect, useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { writeLocalStorageValue } from '@/hooks/use-browser-storage';
import { cn } from '@/lib/utils';

function storageKey(slug) {
  return `meridian:journal-comments:${slug}`;
}

function readComments(slug) {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeComments(slug, comments) {
  writeLocalStorageValue(storageKey(slug), JSON.stringify(comments));
}

/**
 * Local-only comments for the static journal (no server/CMS).
 * Persisted per post slug in localStorage for the demo.
 */
export function JournalPostComments({ slug }) {
  const t = useTranslations('Journal.post');
  const formId = useId();
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setComments(readComments(slug));
  }, [slug]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedBody = body.trim();

    if (trimmedName.length < 2 || trimmedBody.length < 3) {
      setError(t('commentsValidation'));
      return;
    }

    const next = [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: trimmedName.slice(0, 80),
        body: trimmedBody.slice(0, 2000),
        createdAt: new Date().toISOString(),
      },
      ...comments,
    ].slice(0, 40);

    writeComments(slug, next);
    setComments(next);
    setName('');
    setBody('');
    setError('');
  }

  return (
    <section
      id="journal-comments"
      aria-labelledby={`${formId}-title`}
      className="scroll-mt-[calc(var(--site-header-height,4.5rem)+1rem)] border-t border-border/60 pt-10"
    >
      <h2 id={`${formId}-title`} className={cn(TYPOGRAPHY.heading, 'text-2xl')}>
        {t('commentsTitle')}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('commentsDescription')}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
          <div>
            <label htmlFor={`${formId}-name`} className="sr-only">
              {t('commentsNameLabel')}
            </label>
            <Input
              id={`${formId}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('commentsNamePlaceholder')}
              autoComplete="nickname"
              maxLength={80}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor={`${formId}-body`} className="sr-only">
              {t('commentsBodyLabel')}
            </label>
            <Textarea
              id={`${formId}-body`}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={t('commentsBodyPlaceholder')}
              rows={3}
              maxLength={2000}
              className="min-h-[5.5rem] resize-y"
            />
          </div>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div>
          <Button type="submit">{t('commentsSubmit')}</Button>
        </div>
      </form>

      <ul className="mt-8 flex flex-col gap-4">
        {comments.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
            {t('commentsEmpty')}
          </li>
        ) : (
          comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-border/60 bg-card px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-foreground">{comment.name}</p>
                <time
                  dateTime={comment.createdAt}
                  className="text-xs text-muted-foreground"
                >
                  {new Date(comment.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {comment.body}
              </p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
