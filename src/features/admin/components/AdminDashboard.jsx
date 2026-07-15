'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AdminSidebar } from '@/features/admin/components/shell/AdminSidebar';
import { CMS_COLLECTION } from '@/constants/cms';
import { AdminAdSensePanel } from '@/features/admin/components/adsense/AdminAdSensePanel';
import { AdminCmsPagesPanel } from '@/features/admin/components/AdminCmsPagesPanel';
import { AdminEmailConnectorsPanel } from '@/features/admin/components/email-connectors/AdminEmailConnectorsPanel';
import { AdminInaccuraciesPanel } from '@/features/admin/components/AdminInaccuraciesPanel';
import { AdminLocationsPanel } from '@/features/admin/components/AdminLocationsPanel';
import { AdminOverviewPanel } from '@/features/admin/components/AdminOverviewPanel';
import { AdminPlatformSettings } from '@/features/admin/components/AdminPlatformSettings';
import { AdminMailingListsPanel } from '@/features/admin/components/subscriptions/AdminMailingListsPanel';
import { AdminAlertConnectorsPanel } from '@/features/admin/components/alert-connectors/AdminAlertConnectorsPanel';
import { AdminUsagePanel, AdminWeatherSettings } from '@/features/admin/components/AdminWeatherSettings';
import { AdminEmailTemplatesPanel } from '@/features/admin/components/AdminEmailTemplatesPanel';
import { AdminEmailSettingsPanel } from '@/features/admin/components/emails/AdminEmailSettingsPanel';
import { DashboardEmailListsPanel } from '@/features/admin/components/dashboard/DashboardEmailListsPanel';
import { AdminProfilePanel } from '@/features/admin/components/users/AdminProfilePanel';
import { AdminUsersPanel } from '@/features/admin/components/users/AdminUsersPanel';
import { ADMIN_SECTION_ALIASES, getAdminSection } from '@/constants/admin';
function resolveSectionFromParams(params) {
  const raw = params.get('section');
  if (!raw) return 'overview';
  const resolved = ADMIN_SECTION_ALIASES[raw] ?? raw;
  return getAdminSection(resolved) ? resolved : 'overview';
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = resolveSectionFromParams(searchParams);

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

  const handleSectionChange = useCallback(
    (sectionId, extras = {}) => {
      const nextSection = ADMIN_SECTION_ALIASES[sectionId] ?? sectionId;
      const resolved = getAdminSection(nextSection) ? nextSection : 'overview';
      setMobileOpen(false);

      const params = new URLSearchParams(searchParams.toString());
      if (resolved === 'overview') {
        params.delete('section');
      } else {
        params.set('section', resolved);
        params.delete('tab');
      }

      if (resolved !== 'email-templates') {
        params.delete('slug');
        params.delete('category');
        params.delete('mode');
      } else {
        if (extras.slug) params.set('slug', extras.slug);
        else if (!extras.keepDeepLink) params.delete('slug');
        if (extras.category) params.set('category', extras.category);
        else if (!extras.keepDeepLink) params.delete('category');
        if (extras.mode === 'compose') params.set('mode', 'compose');
        else if (!extras.keepDeepLink) params.delete('mode');
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const sectionMeta = getAdminSection(activeSection);

  function renderSection() {
    switch (activeSection) {
      case 'overview':
        return (
          <AdminOverviewPanel
            usage={data?.usage}
            ads={data?.ads}
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
      case 'mailing-lists':
      case 'newsletter':
      case 'weekly-digests':
      case 'alert-subscribers':
      case 'weather-alerts':
        return <AdminMailingListsPanel />;
      case 'email-dashboard':
        return <DashboardEmailListsPanel />;
      case 'email-templates':
      case 'auth-emails':
      case 'admin-emails':
        return <AdminEmailTemplatesPanel />;
      case 'email-settings':
        return (
          <AdminEmailSettingsPanel
            settings={data?.settings}
            onUpdated={handleUpdated}
            onSectionChange={handleSectionChange}
          />
        );
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
      case 'profile':
        return (
          <AdminProfilePanel
            currentUser={user}
            onUserUpdated={(nextUser) => {
              setUser(nextUser);
              refreshUser();
            }}
          />
        );
      case 'users':
        return <AdminUsersPanel currentUser={user} />;
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
        onOpenProfile={() => handleSectionChange('profile')}
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
