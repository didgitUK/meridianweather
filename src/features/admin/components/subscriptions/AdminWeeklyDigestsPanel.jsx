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
    key: 'cityName',
    label: 'Location',
    value: (sub) => sub.cityName ?? '',
    render: (sub) => sub.cityName || '—',
  },
  {
    key: 'frequency',
    label: 'Frequency',
    value: (sub) => sub.frequency ?? 'weekly',
  },
  {
    key: 'subscribedAt',
    label: 'Subscribed',
    value: (sub) => sub.createdAt ?? '',
    render: (sub) => formatSubscribedAt(sub.createdAt),
  },
];

export function AdminWeeklyDigestsPanel() {
  return (
    <AdminSubscriptionListPanel
      type={SUBSCRIPTION_TYPES.weekly}
      title="Weekly digests"
      description="One email per address covering every location they subscribed to (max 20). Each admin row is still one location signup."
      emptyMessage="No weekly digest signups yet."
      csvBasename="meridian-weekly-digests"
      columns={COLUMNS}
    />
  );
}
