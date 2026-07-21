'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/features/admin/components/AdminPanel';
import { PLACE_ARTICLE_STATUS } from '@/constants/place-content';
import { sanitizeCmsHtml } from '@/lib/cms/cms-body';
import { cn } from '@/lib/utils';

async function fetchArticles() {
  const response = await fetch('/api/admin/place-articles');
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message ?? 'Unable to load place guides');
  }
  return payload.articles ?? [];
}

export function AdminPlaceGuidesPanel() {
  const [articles, setArticles] = useState([]);
  const [activeKey, setActiveKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const active = useMemo(
    () => articles.find((article) => `${article.placeSlug}/${article.slug}` === activeKey) ?? null,
    [activeKey, articles],
  );

  const reload = useCallback(async () => {
    const next = await fetchArticles();
    setArticles(next);
    if (!activeKey && next[0]) {
      setActiveKey(`${next[0].placeSlug}/${next[0].slug}`);
    }
  }, [activeKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchArticles();
        if (cancelled) return;
        setArticles(next);
        if (next[0]) {
          setActiveKey(`${next[0].placeSlug}/${next[0].slug}`);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function patchActive(patch) {
    if (!active) return;
    setIsSaving(true);
    setError('');
    setStatus('');
    try {
      const response = await fetch('/api/admin/place-articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeSlug: active.placeSlug,
          slug: active.slug,
          ...patch,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? 'Save failed');
      }
      setStatus('Saved');
      await reload();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <AdminPanel title="Place guides" description="Loading…" />;
  }

  return (
    <AdminPanel
      title="Place guides"
      description="Review auto-generated location guides. Publish, unpublish, or lock after edits."
    >
      {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
      {status ? <p className="mb-3 text-sm text-muted-foreground">{status}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <ul className="max-h-[28rem] space-y-1 overflow-y-auto rounded-lg border p-2">
          {articles.length === 0 ? (
            <li className="p-2 text-sm text-muted-foreground">No generated guides yet.</li>
          ) : (
            articles.map((article) => {
              const key = `${article.placeSlug}/${article.slug}`;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveKey(key);
                      setStatus('');
                      setError('');
                    }}
                    className={cn(
                      'w-full rounded-md px-2 py-2 text-left text-sm',
                      key === activeKey ? 'bg-muted font-medium' : 'hover:bg-muted/60',
                    )}
                  >
                    <span className="block truncate">{article.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {article.placeSlug} · {article.status}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {active ? (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-heading text-lg">{active.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{active.excerpt}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                /weather/{active.placeSlug}/guides/{active.slug}
                {' · '}
                {active.wordCount} words
                {' · '}
                {active.lockedByAdmin ? 'locked' : 'unlocked'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={isSaving || active.status === PLACE_ARTICLE_STATUS.published}
                onClick={() => patchActive({ status: PLACE_ARTICLE_STATUS.published })}
              >
                Publish
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving || active.status === PLACE_ARTICLE_STATUS.draft}
                onClick={() => patchActive({ status: PLACE_ARTICLE_STATUS.draft })}
              >
                Unpublish
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => patchActive({ lockedByAdmin: !active.lockedByAdmin })}
              >
                {active.lockedByAdmin ? 'Unlock' : 'Lock edits'}
              </Button>
              <a
                href={active.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium hover:bg-muted"
              >
                View
              </a>
            </div>

            <div
              className="max-h-[20rem] overflow-y-auto rounded-lg border bg-muted/20 p-4 text-sm prose prose-sm dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(active.bodyHtml) }}
            />
          </div>
        ) : null}
      </div>
    </AdminPanel>
  );
}
