'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminField, AdminPanel } from '@/features/admin/components/AdminPanel';
import { cn } from '@/lib/utils';

function createEmptySection() {
  return {
    id: `section-${Date.now()}`,
    title: '',
    body: '',
  };
}

async function fetchPages(collection) {
  const response = await fetch(`/api/admin/cms-pages?collection=${encodeURIComponent(collection)}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? 'Unable to load CMS pages');
  }

  return payload.pages ?? [];
}

export function AdminCmsPagesPanel({
  collection,
  title,
  description,
}) {
  const [pages, setPages] = useState([]);
  const [activeSlug, setActiveSlug] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const activePage = useMemo(
    () => pages.find((page) => page.slug === activeSlug) ?? null,
    [activeSlug, pages],
  );

  const applyPage = useCallback((page) => {
    if (!page) {
      return;
    }

    setActiveSlug(page.slug);
    setPageTitle(page.title);
    setLastUpdated(page.lastUpdated);
    setSections(
      (page.sections ?? []).map((section) => ({
        id: section.id,
        title: section.title,
        body: section.body,
      })),
    );
    setStatus('');
    setError('');
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const nextPages = await fetchPages(collection);
        if (cancelled) {
          return;
        }

        setPages(nextPages);
        applyPage(nextPages[0] ?? null);
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
  }, [applyPage, collection]);

  function updateSection(index, partial) {
    setSections((current) =>
      current.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...partial } : section,
      ),
    );
  }

  function removeSection(index) {
    setSections((current) => current.filter((_, sectionIndex) => sectionIndex !== index));
  }

  async function handleSave() {
    setIsSaving(true);
    setError('');
    setStatus('');

    try {
      const response = await fetch('/api/admin/cms-pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection,
          slug: activeSlug,
          title: pageTitle,
          lastUpdated,
          sections,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to save page');
      }

      setPages(payload.pages ?? []);
      applyPage(payload.page);
      setStatus('Page saved.');
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
      const response = await fetch('/api/admin/cms-pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection,
          slug: activeSlug,
          action: 'reset',
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to reset page');
      }

      setPages(payload.pages ?? []);
      applyPage(payload.page);
      setStatus('Page reset to file defaults.');
    } catch (resetError) {
      setError(resetError.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading {title.toLowerCase()}…</p>;
  }

  if (!activePage) {
    return (
      <AdminPanel title={title} description={description}>
        <p className="text-sm text-muted-foreground">No pages available.</p>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </AdminPanel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPanel title={title} description={description}>
        <div className="flex flex-wrap gap-2">
          {pages.map((page) => {
            const isActive = page.slug === activeSlug;

            return (
              <button
                key={page.slug}
                type="button"
                onClick={() => applyPage(page)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                {page.title}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Slug: {activePage.slug}</p>
      </AdminPanel>

      <AdminPanel title="Page details" description="Title and last-updated date shown on the public page.">
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Title">
            <Input value={pageTitle} onChange={(event) => setPageTitle(event.target.value)} />
          </AdminField>
          <AdminField label="Last updated" hint="Displayed as plain text, e.g. 2026-07-12">
            <Input value={lastUpdated} onChange={(event) => setLastUpdated(event.target.value)} />
          </AdminField>
        </div>
      </AdminPanel>

      <AdminPanel title="Sections" description="Each section becomes a heading and body paragraph on the public page.">
        <div className="flex flex-col gap-4">
          {sections.map((section, index) => (
            <div key={`${section.id}-${index}`} className="rounded-lg border border-border/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Section {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={sections.length <= 1}
                  onClick={() => removeSection(index)}
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-3">
                <AdminField label="Section id" hint="Used for on-page anchors.">
                  <Input
                    value={section.id}
                    onChange={(event) => updateSection(index, { id: event.target.value })}
                  />
                </AdminField>
                <AdminField label="Heading">
                  <Input
                    value={section.title}
                    onChange={(event) => updateSection(index, { title: event.target.value })}
                  />
                </AdminField>
                <AdminField label="Body">
                  <textarea
                    value={section.body}
                    onChange={(event) => updateSection(index, { body: event.target.value })}
                    rows={5}
                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed"
                  />
                </AdminField>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={() => setSections((current) => [...current, createEmptySection()])}>
            Add section
          </Button>
        </div>
      </AdminPanel>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save page'}
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
