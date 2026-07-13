import { NextResponse } from 'next/server';
import {
  deactivateSubscription,
  getSubscriptionByToken,
} from '@/lib/db/repositories/subscriptions';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'token is required' },
      { status: 400 },
    );
  }

  const subscription = getSubscriptionByToken(token);
  if (!subscription) {
    return NextResponse.json(
      { error: 'not_found', message: 'Subscription not found' },
      { status: 404 },
    );
  }

  deactivateSubscription(token);
  return NextResponse.json({ success: true, email: subscription.email });
}
