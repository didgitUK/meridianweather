import { NextResponse } from 'next/server';
import { listActiveSubscriptions } from '@/lib/db/repositories/subscriptions';
import { SUBSCRIPTION_TYPES } from '@/features/subscriptions/utils/subscription-state';
import { updatePlatformSettings } from '@/lib/platform-settings';
import { syncNewsletterContacts } from '@/lib/server/email-provider';
import { getEmailConnectorsAdminConfig } from '@/lib/server/email-connectors';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function POST(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  const subscribers = listActiveSubscriptions(SUBSCRIPTION_TYPES.newsletter);
  const result = await syncNewsletterContacts(subscribers);

  if (!result.synced && result.reason) {
    return NextResponse.json(
      {
        error: result.reason,
        message: result.message ?? 'Unable to sync newsletter contacts.',
        emailConnectors: getEmailConnectorsAdminConfig(),
      },
      { status: result.reason === 'email_not_configured' || result.reason === 'audience_not_configured' ? 400 : 500 },
    );
  }

  const syncedAt = new Date().toISOString();
  updatePlatformSettings({ emailLastSyncedAt: syncedAt });

  return NextResponse.json({
    ...result,
    syncedAt,
    emailConnectors: getEmailConnectorsAdminConfig(),
  });
}
