import { NextResponse } from 'next/server';
import { logAdminAuditEvent } from '@/lib/admin-audit-repo';
import { EMAIL_PROVIDERS, resolveProviderApiKey } from '@/lib/server/email-connectors';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

const PROVIDER_ACTIONS = {
  [EMAIL_PROVIDERS.resend]: 'resend_api_key_viewed',
  [EMAIL_PROVIDERS.sendgrid]: 'sendgrid_api_key_viewed',
  [EMAIL_PROVIDERS.ses]: 'ses_secret_access_key_viewed',
};

export async function POST(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => ({}));
  const provider = String(body.provider ?? EMAIL_PROVIDERS.resend).trim();

  if (!PROVIDER_ACTIONS[provider]) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Unsupported email provider' },
      { status: 400 },
    );
  }

  const resolved = resolveProviderApiKey(provider);
  if (!resolved.key) {
    return NextResponse.json(
      { error: 'not_configured', message: `No ${provider} API key is configured.` },
      { status: 404 },
    );
  }

  logAdminAuditEvent({
    action: PROVIDER_ACTIONS[provider],
    meta: { source: resolved.source },
  });

  return NextResponse.json({
    key: resolved.key,
    source: resolved.source,
    provider,
    viewedAt: new Date().toISOString(),
  });
}
