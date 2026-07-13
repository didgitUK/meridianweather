'use client';

import { SUBSCRIPTION_TYPES } from '@/features/subscriptions/utils/subscription-state';
import {
  AdminSubscriptionListPanel,
  formatSubscribedAt,
} from '@/features/admin/components/subscriptions/AdminSubscriptionListPanel';

const COLUMNS = [
  {
    key: 'email',
    label: 'Email',
    value: (sub) => sub.email,
  },
  {
    key: 'subscribedAt',
    label: 'Subscribed',
    value: (sub) => sub.createdAt ?? '',
    render: (sub) => formatSubscribedAt(sub.createdAt),
  },
];

export function AdminNewsletterPanel() {
  return (
    <AdminSubscriptionListPanel
      type={SUBSCRIPTION_TYPES.newsletter}
      title="Newsletter"
      description="People signed up for the Meridian platform newsletter. Entries stay listed here until they unsubscribe or you delete them."
      emptyMessage="No newsletter signups yet."
      csvBasename="meridian-newsletter"
      columns={COLUMNS}
    />
  );
}
