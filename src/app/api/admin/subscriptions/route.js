import { NextResponse } from 'next/server';
import { SUBSCRIPTION_TYPES } from '@/features/subscriptions/utils/subscription-state';
import {
  countSubscriptions,
  deleteSubscriptionsByIds,
  getSubscriptionById,
  getSubscriptionSummary,
  listSubscriptions,
  updateSubscriptionAlertPrefs,
} from '@/lib/db/repositories/subscriptions';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';

const ALLOWED_TYPES = new Set(Object.values(SUBSCRIPTION_TYPES));

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

function parseActiveParam(value) {
  if (value == null || value === '') {
    return null;
  }

  if (value === '1' || value === 'true') {
    return true;
  }

  if (value === '0' || value === 'false') {
    return false;
  }

  return null;
}

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get('type');
  const type = typeParam && ALLOWED_TYPES.has(typeParam) ? typeParam : null;
  const active = parseActiveParam(searchParams.get('active'));
  const limit = Math.min(Number(searchParams.get('limit') ?? 500) || 500, 2000);
  const offset = Math.max(Number(searchParams.get('offset') ?? 0) || 0, 0);

  return NextResponse.json({
    summary: getSubscriptionSummary(),
    total: countSubscriptions({ type, active }),
    subscriptions: listSubscriptions({ type, active, limit, offset }),
  });
}

export async function PATCH(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const id = body?.id != null ? String(body.id) : '';

  if (!id) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Provide a subscription id.' },
      { status: 400 },
    );
  }

  const current = getSubscriptionById(id);
  if (!current) {
    return NextResponse.json(
      { error: 'not_found', message: 'Subscription not found.' },
      { status: 404 },
    );
  }

  if (current.type !== SUBSCRIPTION_TYPES.alerts) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Alert prefs can only be updated on weather alert signups.' },
      { status: 400 },
    );
  }

  /** @type {Record<string, boolean>} */
  const partialPrefs = {};

  if (body.alertPrefs && typeof body.alertPrefs === 'object') {
    for (const [key, value] of Object.entries(body.alertPrefs)) {
      if (typeof value === 'boolean') {
        partialPrefs[key] = value;
      }
    }
  }

  // Legacy rain/storm toggles still accepted.
  if (body.alertOnRain != null) {
    partialPrefs.rain = Boolean(body.alertOnRain);
  }
  if (body.alertOnStorm != null) {
    partialPrefs.thunderstorm = Boolean(body.alertOnStorm);
  }

  if (Object.keys(partialPrefs).length === 0) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Provide alertPrefs updates.' },
      { status: 400 },
    );
  }

  const result = updateSubscriptionAlertPrefs(id, partialPrefs);
  if (!result) {
    return NextResponse.json(
      { error: 'not_found', message: 'Subscription not found.' },
      { status: 404 },
    );
  }

  return NextResponse.json({
    removed: result.removed,
    subscription: result.subscription,
    summary: getSubscriptionSummary(),
  });
}

export async function DELETE(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const ids = Array.isArray(body?.ids) ? body.ids.map(String) : [];

  if (ids.length === 0) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Provide at least one subscription id.' },
      { status: 400 },
    );
  }

  const deleted = deleteSubscriptionsByIds(ids);

  return NextResponse.json({
    deleted,
    summary: getSubscriptionSummary(),
  });
}
