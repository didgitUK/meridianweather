'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminField, AdminPanel } from '@/features/admin/components/AdminPanel';
import { cn } from '@/lib/utils';

function interpolateDraft(value, vars = {}) {
  return String(value ?? '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    if (!(key in vars)) {
      return match;
    }

    return String(vars[key] ?? '');
  });
}

async function fetchTemplates() {
  const response = await fetch('/api/admin/email-templates');
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? 'Unable to load email templates');
  }

  return payload.templates ?? [];
}

export function AdminEmailTemplatesPanel() {
  const [templates, setTemplates] = useState([]);
  const [activeSlug, setActiveSlug] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const activeTemplate = useMemo(
    () => templates.find((template) => template.slug === activeSlug) ?? null,
    [activeSlug, templates],
  );

  const previewSubject = useMemo(
    () => interpolateDraft(subject, activeTemplate?.previewVars),
    [activeTemplate?.previewVars, subject],
  );

  const previewHtml = useMemo(
    () => interpolateDraft(html, activeTemplate?.previewVars),
    [activeTemplate?.previewVars, html],
  );

  const applyTemplate = useCallback((template) => {
    if (!template) {
      return;
    }

    setActiveSlug(template.slug);
    setSubject(template.subject);
    setHtml(template.html);
    setStatus('');
    setError('');
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const nextTemplates = await fetchTemplates();
        if (cancelled) {
          return;
        }

        setTemplates(nextTemplates);
        applyTemplate(nextTemplates[0] ?? null);
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
  }, [applyTemplate]);

  async function handleSave() {
    setIsSaving(true);
    setError('');
    setStatus('');

    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: activeSlug, subject, html }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to save template');
      }

      setTemplates(payload.templates ?? []);
      applyTemplate(payload.template);
      setStatus('Template saved.');
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
      const response = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: activeSlug, action: 'reset' }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to reset template');
      }

      setTemplates(payload.templates ?? []);
      applyTemplate(payload.template);
      setStatus('Template reset to default.');
    } catch (resetError) {
      setError(resetError.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading email templates…</p>;
  }

  if (!activeTemplate) {
    return (
      <AdminPanel title="Email templates" description="Manage outbound email HTML.">
        <p className="text-sm text-muted-foreground">No templates available.</p>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </AdminPanel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPanel
        title="Email templates"
        description="Edit the HTML and subject lines used for welcome, weekly digest, and weather alert emails. Use {{variable}} placeholders."
      >
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => {
            const isActive = template.slug === activeSlug;

            return (
              <button
                key={template.slug}
                type="button"
                onClick={() => applyTemplate(template)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                {template.label}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-sm text-muted-foreground">{activeTemplate.description}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Variables: {activeTemplate.variables.map((variable) => `{{${variable}}}`).join(', ')}
        </p>
      </AdminPanel>

      <AdminPanel title={activeTemplate.label} description={`Slug: ${activeTemplate.slug}`}>
        <div className="flex flex-col gap-4">
          <AdminField label="Subject">
            <Input value={subject} onChange={(event) => setSubject(event.target.value)} />
          </AdminField>

          <AdminField label="HTML" hint="Full HTML document. Preview uses sample placeholder values.">
            <textarea
              value={html}
              onChange={(event) => setHtml(event.target.value)}
              rows={18}
              className="min-h-64 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs leading-relaxed"
              spellCheck={false}
            />
          </AdminField>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save template'}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving}>
              Reset to default
            </Button>
          </div>

          {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </AdminPanel>

      <AdminPanel title="Preview" description={previewSubject || 'Rendered subject will appear here.'}>
        <div className="overflow-hidden rounded-lg border border-border/70 bg-white">
          <iframe
            title={`${activeTemplate.label} preview`}
            srcDoc={previewHtml}
            className="h-[28rem] w-full bg-white"
            sandbox=""
          />
        </div>
      </AdminPanel>
    </div>
  );
}
