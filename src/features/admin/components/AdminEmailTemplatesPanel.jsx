'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AdminBodySidebar } from '@/features/admin/components/AdminBodySidebar';
import { AdminField, AdminPanel } from '@/features/admin/components/AdminPanel';
import { AdminEmailComposeForm } from '@/features/admin/components/emails/AdminEmailComposeForm';
import {
  EMAIL_TEMPLATE_CATEGORIES,
  EMAIL_TEMPLATE_SLUGS,
} from '@/constants/email-template-slugs';
import { ADMIN_SECTION_IDS } from '@/constants/admin';

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

function templateGroupId(template) {
  if (template.category === EMAIL_TEMPLATE_CATEGORIES.AUTH) {
    return 'auth';
  }
  if (template.category === EMAIL_TEMPLATE_CATEGORIES.ADMIN) {
    return 'admin';
  }
  if (
    template.slug === EMAIL_TEMPLATE_SLUGS.WELCOME ||
    template.slug === EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST
  ) {
    return 'welcome-digest';
  }
  return 'mailing-alerts';
}

const TEMPLATE_GROUPS_META = [
  { id: 'mailing-alerts', label: 'Mailing alerts' },
  { id: 'welcome-digest', label: 'Welcome & digest' },
  { id: 'auth', label: 'Auth' },
  { id: 'admin', label: 'Admin replies' },
];

export function AdminEmailTemplatesPanel({
  title = 'Email Templates',
  description = 'Mailing, auth, and admin reply HTML.',
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get('slug') ?? '';
  const initialCategory = searchParams.get('category') ?? '';
  const mode = searchParams.get('mode') === 'compose' ? 'compose' : 'templates';

  const [templates, setTemplates] = useState([]);
  const [activeSlug, setActiveSlug] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const activeTemplate = useMemo(
    () => templates.find((template) => template.slug === activeSlug) ?? null,
    [activeSlug, templates],
  );

  const sidebarGroups = useMemo(() => {
    return TEMPLATE_GROUPS_META.map((group) => ({
      ...group,
      items: templates
        .filter((template) => templateGroupId(template) === group.id)
        .map((template) => ({
          id: template.slug,
          label: template.label,
        })),
    })).filter((group) => group.items.length > 0);
  }, [templates]);

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

  const syncUrl = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('section', ADMIN_SECTION_IDS.emailTemplates);
      if (next.slug) {
        params.set('slug', next.slug);
      } else {
        params.delete('slug');
      }
      if (next.category) {
        params.set('category', next.category);
      } else {
        params.delete('category');
      }
      if (next.mode === 'compose') {
        params.set('mode', 'compose');
      } else {
        params.delete('mode');
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleSelectTemplate = useCallback(
    (slug) => {
      const template = templates.find((entry) => entry.slug === slug);
      applyTemplate(template ?? null);
      syncUrl({
        slug,
        category: template?.category ?? null,
        mode: 'templates',
      });
    },
    [applyTemplate, syncUrl, templates],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const nextTemplates = await fetchTemplates();
        if (cancelled) {
          return;
        }

        setTemplates(nextTemplates);

        let selected =
          (initialSlug && nextTemplates.find((template) => template.slug === initialSlug)) ||
          null;

        if (!selected && initialCategory) {
          selected = nextTemplates.find((template) => template.category === initialCategory) ?? null;
        }

        applyTemplate(selected ?? nextTemplates[0] ?? null);
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
  }, [applyTemplate, initialCategory, initialSlug]);

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

  function handleModeChange(nextMode) {
    syncUrl({
      slug: activeSlug || null,
      category: activeTemplate?.category ?? null,
      mode: nextMode,
    });
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading email templates…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={mode === 'templates' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('templates')}
        >
          Templates
        </Button>
        <Button
          type="button"
          variant={mode === 'compose' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('compose')}
        >
          Compose &amp; send
        </Button>
      </div>

      {mode === 'compose' ? (
        <AdminEmailComposeForm />
      ) : !activeTemplate ? (
        <AdminPanel title={title} description={description}>
          <p className="text-sm text-muted-foreground">No templates available.</p>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        </AdminPanel>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <AdminBodySidebar
            title={title}
            description={description}
            ariaLabel={title}
            groups={sidebarGroups}
            activeId={activeSlug}
            onSelect={handleSelectTemplate}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <AdminPanel title={activeTemplate.label} description={`Slug: ${activeTemplate.slug}`}>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">{activeTemplate.description}</p>
                <p className="text-xs text-muted-foreground">
                  Variables:{' '}
                  {(activeTemplate.variables ?? []).map((variable) => `{{${variable}}}`).join(', ')}
                </p>

                <AdminField label="Subject">
                  <Input value={subject} onChange={(event) => setSubject(event.target.value)} />
                </AdminField>

                <AdminField
                  label="HTML"
                  hint="Full HTML document. Preview uses sample placeholder values."
                >
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
                  <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
                    Preview
                  </Button>
                </div>

                {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
              </div>
            </AdminPanel>
          </div>
        </div>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex max-h-[90vh] w-[min(96vw,56rem)] max-w-none flex-col gap-3 sm:max-w-none">
          <DialogHeader>
            <DialogTitle>{activeTemplate?.label ?? 'Preview'}</DialogTitle>
            <DialogDescription>
              {previewSubject || 'Rendered subject will appear here.'}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border/70 bg-white">
            <iframe
              title={`${activeTemplate?.label ?? 'Email'} preview`}
              srcDoc={previewHtml}
              className="h-[min(70vh,36rem)] w-full bg-white"
              sandbox=""
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
