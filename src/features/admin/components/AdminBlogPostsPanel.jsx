'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminField, AdminPanel } from '@/features/admin/components/AdminPanel';
import { AdminRichTextEditor } from '@/features/admin/components/AdminRichTextEditor';
import { cn } from '@/lib/utils';

async function fetchPosts() {
  const response = await fetch('/api/admin/blog-posts');
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? 'Unable to load blog posts');
  }

  return payload.posts ?? [];
}

export function AdminBlogPostsPanel() {
  const [posts, setPosts] = useState([]);
  const [activeSlug, setActiveSlug] = useState('');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [dateIso, setDateIso] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const activePost = useMemo(
    () => posts.find((post) => post.slug === activeSlug) ?? null,
    [activeSlug, posts],
  );

  const applyPost = useCallback((post) => {
    if (!post) {
      return;
    }

    setActiveSlug(post.slug);
    setTitle(post.title ?? '');
    setExcerpt(post.excerpt ?? '');
    setCategory(post.category ?? '');
    setDateIso(post.dateIso ?? '');
    setDateLabel(post.dateLabel ?? '');
    setImageUrl(post.imageUrl ?? '');
    setImageAlt(post.imageAlt ?? '');
    setBodyHtml(post.bodyHtml ?? '');
    setStatus('');
    setError('');
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const nextPosts = await fetchPosts();
        if (cancelled) {
          return;
        }

        setPosts(nextPosts);
        applyPost(nextPosts[0] ?? null);
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
  }, [applyPost]);

  async function handleSave() {
    setIsSaving(true);
    setError('');
    setStatus('');

    try {
      const response = await fetch('/api/admin/blog-posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: activeSlug,
          title,
          excerpt,
          category,
          dateIso,
          dateLabel,
          imageUrl,
          imageAlt,
          bodyHtml,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to save post');
      }

      setPosts(payload.posts ?? []);
      applyPost(payload.post);
      setStatus('Article saved.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    setIsSaving(true);
    setError('');
    setStatus('');

    try {
      const response = await fetch('/api/admin/blog-posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: activeSlug,
          action: 'reset',
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to reset post');
      }

      setPosts(payload.posts ?? []);
      applyPost(payload.post);
      setStatus('Article reset to file defaults.');
    } catch (resetError) {
      setError(resetError.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading blog articles…</p>;
  }

  if (!activePost) {
    return (
      <AdminPanel
        title="Blog Articles"
        description="Edit journal posts shown on the public site under /journal."
      >
        <p className="text-sm text-muted-foreground">No articles available.</p>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </AdminPanel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPanel
        title="Blog Articles"
        description="Edit journal posts for the default locale. Non-English locales still use content packs where provided."
      >
        <div className="flex flex-wrap gap-2">
          {posts.map((post) => {
            const isActive = post.slug === activeSlug;

            return (
              <button
                key={post.slug}
                type="button"
                onClick={() => applyPost(post)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                {post.title}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Slug: {activePost.slug}</p>
      </AdminPanel>

      <AdminPanel title="Article details" description="Metadata and hero image for the public journal page.">
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Title">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </AdminField>
          <AdminField label="Category">
            <Input value={category} onChange={(event) => setCategory(event.target.value)} />
          </AdminField>
          <AdminField label="Date label" hint="Displayed as plain text, e.g. 12 Jul 2026">
            <Input value={dateLabel} onChange={(event) => setDateLabel(event.target.value)} />
          </AdminField>
          <AdminField label="Date ISO" hint="Used for sorting and schema, e.g. 2026-07-12">
            <Input value={dateIso} onChange={(event) => setDateIso(event.target.value)} />
          </AdminField>
          <div className="md:col-span-2">
            <AdminField label="Image URL">
              <Input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
            </AdminField>
          </div>
          <div className="md:col-span-2">
            <AdminField label="Image alt">
              <Input value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} />
            </AdminField>
          </div>
          <div className="md:col-span-2">
            <AdminField label="Excerpt">
              <textarea
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                rows={3}
                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed"
              />
            </AdminField>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel title="Body" description="Rich text shown on the journal article page.">
        <AdminRichTextEditor
          key={activeSlug}
          value={bodyHtml}
          onChange={setBodyHtml}
          minHeightClass="min-h-56"
        />
      </AdminPanel>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save article'}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving}>
          Reset to defaults
        </Button>
      </div>

      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
