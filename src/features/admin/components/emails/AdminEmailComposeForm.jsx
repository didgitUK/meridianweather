'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminField, AdminPanel } from '@/features/admin/components/AdminPanel';
import { EMAIL_TEMPLATE_CATEGORIES } from '@/constants/email-template-slugs';

async function parseJson(response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message ?? 'Request failed');
  }
  return payload;
}

export function AdminEmailComposeForm() {
  const [templates, setTemplates] = useState([]);
  const [slug, setSlug] = useState('');
  const [to, setTo] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState('');
  const [messageHtml, setMessageHtml] = useState('<p></p>');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const payload = await parseJson(
          await fetch(`/api/admin/email-templates?category=${EMAIL_TEMPLATE_CATEGORIES.ADMIN}`),
        );
        if (cancelled) return;
        const next = payload.templates ?? [];
        setTemplates(next);
        if (next[0]) {
          setSlug(next[0].slug);
          setSubject(String(next[0].previewVars?.subject ?? next[0].subject ?? ''));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeTemplate = useMemo(
    () => templates.find((template) => template.slug === slug) ?? null,
    [slug, templates],
  );

  function handleTemplateChange(nextSlug) {
    setSlug(nextSlug);
    const template = templates.find((entry) => entry.slug === nextSlug);
    if (template) {
      setSubject(String(template.previewVars?.subject ?? template.subject ?? ''));
    }
  }

  async function handleSend(event) {
    event.preventDefault();
    setIsSending(true);
    setError('');
    setStatus('');

    try {
      await parseJson(
        await fetch('/api/admin/email/compose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            to,
            recipientName: recipientName || to,
            subject,
            messageHtml,
          }),
        }),
      );
      setStatus('Email sent.');
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AdminPanel
      title="Compose & send"
      description="Send an admin reply using a saved template via your active email connector."
    >
      <form onSubmit={handleSend} className="grid gap-4">
        <AdminField label="Template">
          <select
            value={slug}
            onChange={(event) => handleTemplateChange(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {templates.map((template) => (
              <option key={template.slug} value={template.slug}>
                {template.label}
              </option>
            ))}
          </select>
        </AdminField>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="To">
            <Input
              type="email"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              required
            />
          </AdminField>
          <AdminField label="Recipient name">
            <Input
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="Defaults to email"
            />
          </AdminField>
        </div>

        <AdminField label="Subject">
          <Input value={subject} onChange={(event) => setSubject(event.target.value)} required />
        </AdminField>

        <AdminField label="Message HTML" hint="Injected into {{messageHtml}} in the template.">
          <textarea
            value={messageHtml}
            onChange={(event) => setMessageHtml(event.target.value)}
            rows={8}
            className="min-h-40 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs leading-relaxed"
            spellCheck={false}
          />
        </AdminField>

        {activeTemplate ? (
          <p className="text-xs text-muted-foreground">
            Using template <span className="font-medium">{activeTemplate.label}</span> ({activeTemplate.slug})
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isSending || !slug}>
            {isSending ? 'Sending…' : 'Send email'}
          </Button>
          {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </form>
    </AdminPanel>
  );
}
