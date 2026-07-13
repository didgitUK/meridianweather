import { AdminMetricCard } from '@/features/admin/components/AdminMetricCard';
import { AdminPanel } from '@/features/admin/components/AdminPanel';

function usageTone(status) {
  if (status === 'hard_block' || status === 'soft_block') {
    return 'danger';
  }
  if (status === 'warning') {
    return 'warning';
  }
  return 'ok';
}

function formatUsageStatus(status) {
  if (status === 'hard_block') {
    return 'Hard block';
  }
  if (status === 'soft_block') {
    return 'Soft block';
  }
  if (status === 'warning') {
    return 'Warning';
  }
  return 'Healthy';
}

function formatResetsAt(iso) {
  if (!iso) {
    return null;
  }

  return `Resets ${new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  })}`;
}

export function AdminOverviewStatusGrid({
  usage,
  settings,
  ads,
  emailConnectors,
  inaccurateReports,
  locations,
  onSectionChange,
}) {
  const openReports = inaccurateReports?.length ?? 0;
  const locationCount = locations?.length ?? 0;
  const keyConfigured = Boolean(settings?.openWeatherApiKeyConfigured);
  const adsLive = Boolean(ads?.scriptEnabled);
  const emailReady = Boolean(emailConnectors?.activeConfigured);
  const emailProvider = emailConnectors?.activeProvider ?? 'email';

  return (
    <AdminPanel
      title="At a glance"
      description="Live snapshot of quota, credentials, reports, and AdSense."
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard
          label="API usage today"
          value={usage ? `${usage.used} / ${usage.dailyLimit}` : '—'}
          hint={
            usage
              ? `${formatUsageStatus(usage.status)} · ${usage.percentUsed}% used · ${formatResetsAt(usage.resetsAt)}`
              : 'Unavailable'
          }
          tone={usage ? usageTone(usage.status) : 'default'}
          onClick={() => onSectionChange('usage')}
        />

        <AdminMetricCard
          label="OpenWeather key"
          value={keyConfigured ? 'Configured' : 'Missing'}
          hint={
            keyConfigured
              ? `Source: ${settings.openWeatherApiKeySource ?? 'unknown'}`
              : 'Add a key in Weather API'
          }
          tone={keyConfigured ? 'ok' : 'danger'}
          onClick={() => onSectionChange('weather-api')}
        />

        <AdminMetricCard
          label="Email connector"
          value={emailReady ? 'Configured' : 'Missing'}
          hint={
            emailReady
              ? `${emailProvider} · ${emailConnectors.activeFromEmail}`
              : 'Add Resend or SendGrid credentials'
          }
          tone={emailReady ? 'ok' : 'warning'}
          onClick={() => onSectionChange('email-connectors')}
        />

        <AdminMetricCard
          label="Inaccuracy reports"
          value={openReports}
          hint={openReports === 0 ? 'No open issues' : 'Needs review'}
          tone={openReports > 0 ? 'warning' : 'ok'}
          onClick={() => onSectionChange('inaccuracies')}
        />

        <AdminMetricCard
          label="Tracked locations"
          value={locationCount}
          hint="From checks log"
          onClick={() => onSectionChange('locations')}
        />

        <AdminMetricCard
          label="AdSense"
          value={adsLive ? 'Live' : settings?.adsenseEnabled ? 'Incomplete' : 'Off'}
          hint={
            adsLive
              ? 'AdSense script enabled'
              : settings?.adsenseEnabled
                ? 'Enabled but client ID missing'
                : 'AdSense disabled'
          }
          tone={adsLive ? 'ok' : settings?.adsenseEnabled ? 'warning' : 'default'}
          onClick={() => onSectionChange('adsense')}
        />

        <AdminMetricCard
          label="Max saved cities"
          value={settings?.maxSavedCities ?? '—'}
          hint="Per-device platform limit"
          onClick={() => onSectionChange('platform')}
        />

        <AdminMetricCard
          label="Newsletter"
          value="Manage"
          hint="Platform newsletter signups"
          onClick={() => onSectionChange('newsletter')}
        />
      </div>
    </AdminPanel>
  );
}
