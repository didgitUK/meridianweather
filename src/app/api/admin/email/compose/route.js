import { NextResponse } from 'next/server';
import { isAdminReplyTemplateSlug } from '@/constants/email-template-slugs';
import { getEmailTemplate } from '@/lib/email-templates/email-template-repo';
import { sendAdminComposeEmail } from '@/lib/email';
import { logAdminAuditEvent } from '@/lib/admin-audit-repo';
import { getAdminSessionFromRequest } from '@/lib/server/admin-auth';
import { parseEmail } from '@/lib/validators';

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export async function POST(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session.authenticated) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const slug = body.slug?.trim() ?? '';
  const recipientNameRaw = body.recipientName?.trim() ?? '';
  const subjectOverride = body.subject?.trim() ?? '';
  const messageHtml = body.messageHtml?.trim() || '<p></p>';

  if (!slug || !isAdminReplyTemplateSlug(slug)) {
    return NextResponse.json(
      { error: 'validation', message: 'A valid admin reply template is required' },
      { status: 400 },
    );
  }

  let to;
  try {
    to = parseEmail(body.to);
  } catch {
    return NextResponse.json(
      { error: 'validation', message: 'A valid recipient email is required' },
      { status: 400 },
    );
  }

  const recipientName = recipientNameRaw || to;

  const template = getEmailTemplate(slug);
  if (!template) {
    return NextResponse.json({ error: 'not_found', message: 'Template not found' }, { status: 404 });
  }

  const vars = {
    recipientName,
    recipientEmail: to,
    subject: subjectOverride || template.subject,
    messageHtml,
    adminName: session.user?.displayName || session.user?.email || 'meridian admin',
    appUrl: getAppUrl(),
  };

  try {
    const result = await sendAdminComposeEmail({ slug, to, vars });

    logAdminAuditEvent({
      action: 'admin_compose_email_sent',
      meta: { actorId: session.user?.id ?? null, slug, to },
    });

    return NextResponse.json({ ok: true, result });
  } catch (sendError) {
    return NextResponse.json(
      { error: 'email_failed', message: sendError.message ?? 'Unable to send email' },
      { status: 502 },
    );
  }
}
