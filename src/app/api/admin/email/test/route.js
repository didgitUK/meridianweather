import { NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email';
import { isEmailConfigured, resolveActiveEmailConnector } from '@/lib/server/email-connectors';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: 'email_not_configured', message: 'Configure an email connector first.' },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const to = String(body.to ?? '').trim();

  if (!isValidEmail(to)) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Provide a valid test recipient email.' },
      { status: 400 },
    );
  }

  try {
    const result = await sendTestEmail({ to });
    const connector = resolveActiveEmailConnector();

    return NextResponse.json({
      ...result,
      to,
      provider: connector.provider,
      fromEmail: connector.fromEmail,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'send_failed',
        message: error instanceof Error ? error.message : 'Unable to send test email.',
      },
      { status: 502 },
    );
  }
}
