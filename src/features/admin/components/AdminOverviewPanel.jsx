'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AdminBodySidebar } from '@/features/admin/components/AdminBodySidebar';
import { DashboardAdSensePanel } from '@/features/admin/components/dashboard/DashboardAdSensePanel';
import { DashboardAnalyticsPanel } from '@/features/admin/components/dashboard/DashboardAnalyticsPanel';
import { DashboardApiPanel } from '@/features/admin/components/dashboard/DashboardApiPanel';
import { DashboardEmailListsPanel } from '@/features/admin/components/dashboard/DashboardEmailListsPanel';
import { DASHBOARD_TAB_IDS, DASHBOARD_TABS } from '@/constants/admin-dashboard';

const DASHBOARD_TAB_ID_SET = new Set(Object.values(DASHBOARD_TAB_IDS));

function resolveDashboardTab(tabParam) {
  if (typeof tabParam === 'string' && DASHBOARD_TAB_ID_SET.has(tabParam)) {
    return tabParam;
  }
  return DASHBOARD_TAB_IDS.analytics;
}

export function AdminOverviewPanel({ usage, ads }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() =>
    resolveDashboardTab(searchParams.get('tab')),
  );

  useEffect(() => {
    setActiveTab(resolveDashboardTab(searchParams.get('tab')));
  }, [searchParams]);

  const handleTabSelect = useCallback(
    (tabId) => {
      const nextTab = resolveDashboardTab(tabId);
      setActiveTab(nextTab);

      const params = new URLSearchParams(searchParams.toString());
      if (nextTab === DASHBOARD_TAB_IDS.analytics) {
        params.delete('tab');
      } else {
        params.set('tab', nextTab);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <AdminBodySidebar
        items={DASHBOARD_TABS}
        activeId={activeTab}
        onSelect={handleTabSelect}
        ariaLabel="Dashboard views"
      />

      <div className="min-w-0 flex-1">
        {activeTab === DASHBOARD_TAB_IDS.analytics ? <DashboardAnalyticsPanel /> : null}
        {activeTab === DASHBOARD_TAB_IDS.api ? <DashboardApiPanel usage={usage} /> : null}
        {activeTab === DASHBOARD_TAB_IDS.emailLists ? <DashboardEmailListsPanel /> : null}
        {activeTab === DASHBOARD_TAB_IDS.adsense ? (
          <DashboardAdSensePanel ads={ads} />
        ) : null}
      </div>
    </div>
  );
}
