'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminBodySidebar } from '@/features/admin/components/AdminBodySidebar';
import { AdminPanel } from '@/features/admin/components/AdminPanel';
import { AdminMailingListAlertRoster } from '@/features/admin/components/subscriptions/AdminMailingListAlertRoster';
import {
  AdminSubscriptionListPanel,
  formatSubscribedAt,
} from '@/features/admin/components/subscriptions/AdminSubscriptionListPanel';
import { ADMIN_SECTION_IDS } from '@/constants/admin';
import {
  DEFAULT_MAILING_LIST_ID,
  getMailingListMeta,
  MAILING_LIST_ALERT_GROUPS,
  MAILING_LIST_TOP_ITEMS,
} from '@/constants/mailing-lists';
import { SUBSCRIPTION_TYPES } from '@/features/subscriptions/utils/subscription-state';

const NEWSLETTER_COLUMNS = [
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

const WEEKLY_COLUMNS = [
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

function SourceBadge({ source }) {
  if (!source) return null;

  return (
    <span className="inline-flex rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {source}
    </span>
  );
}

export function AdminMailingListsPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeListId, setActiveListId] = useState(DEFAULT_MAILING_LIST_ID);

  const meta = useMemo(() => getMailingListMeta(activeListId), [activeListId]);

  function goEditTemplate() {
    if (!meta?.templateSlug) return;
    const params = new URLSearchParams();
    params.set('section', ADMIN_SECTION_IDS.emailTemplates);
    params.set('slug', meta.templateSlug);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (!meta) {
    return (
      <AdminPanel title="Mailing Lists" description="Select a list from the sidebar.">
        <p className="text-sm text-muted-foreground">Unknown mailing list.</p>
      </AdminPanel>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <AdminBodySidebar
        title="Mailing Lists"
        description="Newsletter, digests, and location alert lists."
        ariaLabel="Mailing lists"
        items={MAILING_LIST_TOP_ITEMS}
        groups={MAILING_LIST_ALERT_GROUPS}
        activeId={activeListId}
        onSelect={setActiveListId}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <AdminPanel title={meta.label} description={meta.description}>
          <div className="flex flex-wrap items-center gap-3">
            <SourceBadge source={meta.source} />
            {meta.kind === 'alert' ? (
              <p className="text-xs text-muted-foreground">
                Alert type id: <span className="font-mono">{meta.alertTypeId}</span>
              </p>
            ) : null}
            {meta.templateSlug ? (
              <button
                type="button"
                onClick={goEditTemplate}
                className="text-sm text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Edit template
              </button>
            ) : null}
          </div>
        </AdminPanel>

        {meta.kind === 'newsletter' ? (
          <AdminSubscriptionListPanel
            type={SUBSCRIPTION_TYPES.newsletter}
            title="Subscribers"
            description="People signed up for the Meridian platform newsletter."
            emptyMessage={meta.emptyMessage}
            csvBasename={meta.csvBasename}
            columns={NEWSLETTER_COLUMNS}
          />
        ) : null}

        {meta.kind === 'weekly' ? (
          <AdminSubscriptionListPanel
            type={SUBSCRIPTION_TYPES.weekly}
            title="Subscribers"
            description="One row per location signup. Outbound digests batch by email address."
            emptyMessage={meta.emptyMessage}
            csvBasename={meta.csvBasename}
            columns={WEEKLY_COLUMNS}
          />
        ) : null}

        {meta.kind === 'alert' ? (
          <AdminMailingListAlertRoster
            alertTypeId={meta.alertTypeId}
            emptyMessage={meta.emptyMessage}
            csvBasename={meta.csvBasename}
          />
        ) : null}
      </div>
    </div>
  );
}
