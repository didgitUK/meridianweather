import { NextResponse } from 'next/server';
import { MAX_WEEKLY_DIGEST_LOCATIONS } from '@/constants/subscriptions';
import {
  countActiveWeeklyDigestsByEmail,
  createSubscription,
  deactivateSubscriptionsByClientCity,
  getSubscriptionById,
  listActiveSubscriptionsByClientId,
  updateSubscriptionAlertPrefs,
} from '@/lib/db/repositories/subscriptions';
import { sendWelcomeEmail } from '@/lib/email';
import { apiError, apiErrorFromCaught } from '@/lib/server/api-response';
import { SUBSCRIPTION_TYPES } from '@/features/subscriptions/utils/subscription-state';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId')?.trim();

    if (!clientId) {
      return apiError('invalid_request', 'clientId is required', 400);
    }

    const subscriptions = listActiveSubscriptionsByClientId(clientId);
    return NextResponse.json({ subscriptions });
  } catch (error) {
    return apiErrorFromCaught(error, { error: 'upstream_error', status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email?.trim();
    const clientId = body.clientId?.trim();
    const type = body.type;

    if (!email || !clientId || !type) {
      return apiError('invalid_request', 'email, clientId and type are required', 400);
    }

    if (type === SUBSCRIPTION_TYPES.weekly) {
      const existing = countActiveWeeklyDigestsByEmail(email);
      if (existing >= MAX_WEEKLY_DIGEST_LOCATIONS) {
        return apiError(
          'limit_reached',
          `You can receive weekly digests for up to ${MAX_WEEKLY_DIGEST_LOCATIONS} locations per email.`,
          400,
        );
      }
    }

    const subscription = createSubscription({
      clientId,
      email,
      type,
      cityName: body.cityName,
      cityLat: body.cityLat,
      cityLon: body.cityLon,
      frequency: body.frequency,
      alertOnRain: Boolean(body.alertOnRain),
      alertOnStorm: Boolean(body.alertOnStorm),
      alertPrefs: body.alertPrefs,
    });

    if (type === SUBSCRIPTION_TYPES.newsletter) {
      await sendWelcomeEmail(email);
    }

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    return apiErrorFromCaught(error, { error: 'upstream_error', status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const clientId = body.clientId?.trim();
    const id = body.id != null ? String(body.id) : '';

    if (!clientId || !id) {
      return apiError('invalid_request', 'clientId and id are required', 400);
    }

    const current = getSubscriptionById(id);
    if (!current || current.clientId !== clientId) {
      return apiError('not_found', 'Subscription not found', 404);
    }

    if (current.type !== SUBSCRIPTION_TYPES.alerts) {
      return apiError(
        'invalid_request',
        'Alert prefs can only be updated on weather alert signups.',
        400,
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

    if (Object.keys(partialPrefs).length === 0) {
      return apiError('invalid_request', 'Provide alertPrefs updates.', 400);
    }

    const result = updateSubscriptionAlertPrefs(id, partialPrefs);
    if (!result) {
      return apiError('not_found', 'Subscription not found', 404);
    }

    return NextResponse.json({
      removed: result.removed,
      subscription: result.subscription,
    });
  } catch (error) {
    return apiErrorFromCaught(error, { error: 'upstream_error', status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const clientId = body.clientId?.trim();
    const cityLat = Number(body.cityLat);
    const cityLon = Number(body.cityLon);
    const types = body.types;

    if (!clientId || !Number.isFinite(cityLat) || !Number.isFinite(cityLon) || !types?.length) {
      return apiError(
        'invalid_request',
        'clientId, cityLat, cityLon and types are required',
        400,
      );
    }

    const deactivatedIds = deactivateSubscriptionsByClientCity({
      clientId,
      cityLat,
      cityLon,
      types,
    });

    return NextResponse.json({ deactivatedIds });
  } catch (error) {
    return apiErrorFromCaught(error, { error: 'upstream_error', status: 500 });
  }
}
