'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/features/admin/components/shell/AdminSidebar';
import { CMS_COLLECTION } from '@/constants/cms';
import { AdminAdSensePanel } from '@/features/admin/components/adsense/AdminAdSensePanel';
import { AdminCmsPagesPanel } from '@/features/admin/components/AdminCmsPagesPanel';
import { AdminEmailConnectorsPanel } from '@/features/admin/components/email-connectors/AdminEmailConnectorsPanel';
import { AdminEmailTemplatesPanel } from '@/features/admin/components/AdminEmailTemplatesPanel';
import { AdminInaccuraciesPanel } from '@/features/admin/components/AdminInaccuraciesPanel';
import { AdminLocationsPanel } from '@/features/admin/components/AdminLocationsPanel';
import { AdminOverviewPanel } from '@/features/admin/components/AdminOverviewPanel';
import { AdminPlatformSettings } from '@/features/admin/components/AdminPlatformSettings';
import { AdminNewsletterPanel } from '@/features/admin/components/subscriptions/AdminNewsletterPanel';
import { AdminWeeklyDigestsPanel } from '@/features/admin/components/subscriptions/AdminWeeklyDigestsPanel';
import { AdminWeatherAlertsPanel } from '@/features/admin/components/subscriptions/AdminWeatherAlertsPanel';
import { AdminAlertConnectorsPanel } from '@/features/admin/components/alert-connectors/AdminAlertConnectorsPanel';
import { AdminUsagePanel, AdminWeatherSettings } from '@/features/admin/components/AdminWeatherSettings';
import { AdminUsersPanel } from '@/features/admin/components/users/AdminUsersPanel';
import { ADMIN_SECTION_ALIASES, getAdminSection } from '@/constants/admin';

function readSectionFromLocation() {
  const raw = new URLSearchParams(window.location.search).get('section');
  if (!raw) return null;
  return ADMIN_SECTION_ALIASES[raw] ?? raw;
}

async function fetchAdminConfig() {
  const response = await fetch('/api/admin/config');
  const payload = await response.json();

  if (response.status === 401) {
    return { unauthorized: true, payload: null };
  }

  if (!response.ok) {
    throw new Error(payload.message ?? 'Unable to load admin dashboard');
  }

  return { unauthorized: false, payload };
}

async function fetchSessionUser() {
  const response = await fetch('/api/auth/session');
  if (!response.ok) {
    return null;
  }
  const payload = await response.json();
  return payload.authenticated ? payload.user : null;
}

export function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window === 'undefined') {
      return 'overview';
    }
    return readSectionFromLocation() || 'overview';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const result = await fetchAdminConfig();

      if (result.unauthorized) {
        router.push('/login');
        return;
      }

      setData(result.payload);
      setError('');
    } catch (refreshError) {
      setError(refreshError.message);
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    const nextUser = await fetchSessionUser();
    setUser(nextUser);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [result, nextUser] = await Promise.all([fetchAdminConfig(), fetchSessionUser()]);

        if (cancelled) {
          return;
        }

        if (result.unauthorized) {
          router.push('/login');
          return;
        }

        setData(result.payload);
        setUser(nextUser);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleUpdated = useCallback((payload) => {
    setData((current) => ({
      ...current,
      settings: payload.settings ?? current?.settings,
      usage: payload.usage ?? current?.usage,
      ads: payload.ads ?? current?.ads,
      emailConnectors: payload.emailConnectors ?? current?.emailConnectors,
      alertConnectors: payload.alertConnectors ?? current?.alertConnectors,
      locations: payload.locations ?? current?.locations,
      inaccurateReports: payload.inaccurateReports ?? current?.inaccurateReports,
    }));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  function handleSectionChange(sectionId) {
    setActiveSection(sectionId);
    setMobileOpen(false);
  }

  const sectionMeta = getAdminSection(activeSection);

  function renderSection() {
    switch (activeSection) {
      case 'overview':
        return (
          <AdminOverviewPanel
            usage={data?.usage}
            settings={data?.settings}
            ads={data?.ads}
            emailConnectors={data?.emailConnectors}
            inaccurateReports={data?.inaccurateReports}
            locations={data?.locations}
            onSectionChange={handleSectionChange}
            onRefresh={refresh}
          />
        );
      case 'usage':
        return <AdminUsagePanel usage={data?.usage} onRefresh={refresh} />;
      case 'weather-api':
        return (
          <AdminWeatherSettings
            settings={data?.settings}
            refreshOptions={data?.refreshOptions ?? []}
            onUpdated={handleUpdated}
            onRefresh={refresh}
          />
        );
      case 'platform':
        return <AdminPlatformSettings settings={data?.settings} onUpdated={handleUpdated} />;
      case 'adsense':
        return (
          <AdminAdSensePanel settings={data?.settings} ads={data?.ads} onUpdated={handleUpdated} />
        );
      case 'email-connectors':
        return (
          <AdminEmailConnectorsPanel
            settings={data?.settings}
            emailConnectors={data?.emailConnectors}
            onUpdated={handleUpdated}
            onRefresh={refresh}
          />
        );
      case 'alert-connectors':
        return (
          <AdminAlertConnectorsPanel
            settings={data?.settings}
            alertConnectors={data?.alertConnectors}
            onUpdated={handleUpdated}
          />
        );
      case 'email-templates':
        return <AdminEmailTemplatesPanel />;
      case 'newsletter':
        return <AdminNewsletterPanel />;
      case 'weekly-digests':
        return <AdminWeeklyDigestsPanel />;
      case 'alert-subscribers':
      case 'weather-alerts':
        return <AdminWeatherAlertsPanel />;
      case 'policies':
        return (
          <AdminCmsPagesPanel
            collection={CMS_COLLECTION.LEGAL}
            title="Policies"
            description="Edit Privacy, Terms, Cookies, and Accessibility content shown on the public legal pages."
          />
        );
      case 'documentation':
        return (
          <AdminCmsPagesPanel
            collection={CMS_COLLECTION.DOCS}
            title="Documentation"
            description="Edit platform documentation pages shown under /docs."
          />
        );
      case 'inaccuracies':
        return (
          <AdminInaccuraciesPanel
            settings={data?.settings}
            reports={data?.inaccurateReports}
            onUpdated={handleUpdated}
            onRefresh={refresh}
          />
        );
      case 'locations':
        return <AdminLocationsPanel locations={data?.locations} onRefresh={refresh} />;
      case 'users':
        return (
          <AdminUsersPanel
            currentUser={user}
            onUserUpdated={(nextUser) => {
              setUser(nextUser);
              refreshUser();
            }}
          />
        );
      default:
        return null;
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-background">
        <p className="text-sm text-muted-foreground">Loading admin dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-background">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:pl-64 dark:bg-background">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        user={user}
        onOpenProfile={() => handleSectionChange('users')}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      <div className="flex min-h-screen flex-col">
        <header className="border-b border-border/60 bg-white px-4 py-5 sm:px-6 lg:px-8 dark:bg-background">
          <h1 className="font-heading text-2xl text-foreground sm:text-3xl">
            {sectionMeta?.label ?? 'Admin dashboard'}
          </h1>
          {sectionMeta?.hint ? (
            <p className="mt-1 text-sm text-muted-foreground">{sectionMeta.hint}</p>
          ) : null}
        </header>

        <div className="flex-1 bg-white px-4 py-6 sm:px-6 lg:px-8 dark:bg-background">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
