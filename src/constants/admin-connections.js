/** Admin sidebar API connection status definitions. */

import { ADMIN_SECTION_IDS } from '@/constants/admin';

export const ADMIN_CONNECTION_KIND = {
  ITEM: 'item',
  GROUP: 'group',
};

export const ADMIN_CONNECTION_STATUS = {
  CHECKING: 'checking',
  CONNECTED: 'connected',
  CONFIGURED: 'configured',
  NOT_CONFIGURED: 'not_configured',
  ERROR: 'error',
  PENDING: 'pending',
  DISABLED: 'disabled',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const ADMIN_CONNECTION_CHECK_MODE = {
  /** Live upstream probe (Weather API). */
  LIVE: 'live',
  /** Credentials / settings only until a live probe lands. */
  CONFIG: 'config',
  /** Placeholder for integrations still being wired by other agents. */
  STUB: 'stub',
};

export const ADMIN_CONNECTIONS = [
  {
    id: 'weather',
    label: 'Weather API',
    description: 'OpenWeather',
    kind: ADMIN_CONNECTION_KIND.ITEM,
    checkMode: ADMIN_CONNECTION_CHECK_MODE.LIVE,
  },
  {
    id: 'adsense',
    label: 'AdSense',
    description: 'Google AdSense',
    kind: ADMIN_CONNECTION_KIND.ITEM,
    checkMode: ADMIN_CONNECTION_CHECK_MODE.LIVE,
  },
  {
    id: 'email',
    label: 'Email',
    description: 'Resend / SendGrid / Amazon SES',
    kind: ADMIN_CONNECTION_KIND.GROUP,
    checkMode: ADMIN_CONNECTION_CHECK_MODE.CONFIG,
  },
];

export const ADMIN_CONNECTION_STATUS_LABEL = {
  [ADMIN_CONNECTION_STATUS.CHECKING]: 'Checking',
  [ADMIN_CONNECTION_STATUS.CONNECTED]: 'Connected',
  [ADMIN_CONNECTION_STATUS.CONFIGURED]: 'Configured',
  [ADMIN_CONNECTION_STATUS.NOT_CONFIGURED]: 'Not set',
  [ADMIN_CONNECTION_STATUS.ERROR]: 'Error',
  [ADMIN_CONNECTION_STATUS.PENDING]: 'Pending',
  [ADMIN_CONNECTION_STATUS.DISABLED]: 'Disabled',
  [ADMIN_CONNECTION_STATUS.ACTIVE]: 'Active',
  [ADMIN_CONNECTION_STATUS.INACTIVE]: 'Inactive',
};

/** Statuses that already have a usable connection — show View instead of Connect. */
export const ADMIN_CONNECTION_READY_STATUSES = new Set([
  ADMIN_CONNECTION_STATUS.CONNECTED,
  ADMIN_CONNECTION_STATUS.CONFIGURED,
  ADMIN_CONNECTION_STATUS.ACTIVE,
]);

/** Maps connection row ids to AdminDashboard section ids. */
export const ADMIN_CONNECTION_SECTION = {
  weather: ADMIN_SECTION_IDS.weatherApi,
  adsense: ADMIN_SECTION_IDS.adsense,
  'email-resend': ADMIN_SECTION_IDS.emailConnectors,
  'email-sendgrid': ADMIN_SECTION_IDS.emailConnectors,
  'email-ses': ADMIN_SECTION_IDS.emailConnectors,
};

export function getAdminConnectionSectionId(connectionId) {
  return ADMIN_CONNECTION_SECTION[connectionId] ?? null;
}

export function isAdminConnectionReady(status) {
  return ADMIN_CONNECTION_READY_STATUSES.has(status);
}

export function getAdminConnectionActionLabel(status) {
  return isAdminConnectionReady(status) ? 'View >' : 'Connect >';
}
