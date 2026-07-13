import { getPlatformSettings } from '@/lib/platform-settings';

const CLIENT_ID_PATTERN = /^ca-pub-\d+$/;
const SLOT_ID_PATTERN = /^\d+$/;

function readClientIdFromEnv() {
  const clientId = process.env.GOOGLE_ADSENSE_CLIENT_ID?.trim() ?? '';
  return CLIENT_ID_PATTERN.test(clientId) ? clientId : '';
}

function readSlotFromEnv(placement) {
  const slots = {
    dashboard: process.env.GOOGLE_ADSENSE_SLOT_DASHBOARD ?? '',
    hero: process.env.GOOGLE_ADSENSE_SLOT_HERO ?? '',
    'recent-checks': process.env.GOOGLE_ADSENSE_SLOT_RECENT ?? '',
    'city-detail': process.env.GOOGLE_ADSENSE_SLOT_CITY_DETAIL ?? '',
  };

  const slotId = (slots[placement] ?? process.env.GOOGLE_ADSENSE_SLOT_DEFAULT ?? '').trim();
  return SLOT_ID_PATTERN.test(slotId) ? slotId : '';
}

export function getAdSenseClientId() {
  const settings = getPlatformSettings();
  const configured = settings.adsenseClientId?.trim() ?? '';

  if (CLIENT_ID_PATTERN.test(configured)) {
    return configured;
  }

  return readClientIdFromEnv();
}

export function getAdSensePublisherId() {
  const clientId = getAdSenseClientId();
  return clientId ? clientId.replace(/^ca-/, '') : '';
}

export function isAdSenseEnabled() {
  const settings = getPlatformSettings();
  return settings.adsenseEnabled && Boolean(getAdSenseClientId());
}

export function getAdSenseSlotForPlacement(placement, placements) {
  if (!placements.includes(placement)) {
    return '';
  }

  const settings = getPlatformSettings();
  const dashboardSlot = settings.adsenseSlotDashboard?.trim() ?? '';

  if (placement === 'dashboard' && SLOT_ID_PATTERN.test(dashboardSlot)) {
    return dashboardSlot;
  }

  return readSlotFromEnv(placement);
}

export function isAdSenseConfigured() {
  return isAdSenseEnabled();
}

export function getAdSenseAdminConfig() {
  const settings = getPlatformSettings();

  return {
    adsenseEnabled: settings.adsenseEnabled,
    adsenseClientId: settings.adsenseClientId,
    adsenseSlotDashboard: settings.adsenseSlotDashboard,
    envClientId: readClientIdFromEnv(),
    envSlotDashboard: readSlotFromEnv('dashboard'),
    effectiveClientId: getAdSenseClientId(),
    effectiveSlotDashboard: getAdSenseSlotForPlacement('dashboard', ['dashboard']),
    scriptEnabled: isAdSenseConfigured(),
  };
}
