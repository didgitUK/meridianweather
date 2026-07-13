/**
 * Flat section ids used by AdminDashboard switch + overview links.
 * Keep in sync with ADMIN_NAV_GROUPS items.
 */
export const ADMIN_SECTION_IDS = {
  overview: 'overview',
  usage: 'usage',
  platform: 'platform',
  locations: 'locations',
  inaccuracies: 'inaccuracies',
  weatherApi: 'weather-api',
  adsense: 'adsense',
  emailConnectors: 'email-connectors',
  alertConnectors: 'alert-connectors',
  emailTemplates: 'email-templates',
  newsletter: 'newsletter',
  weeklyDigests: 'weekly-digests',
  alertSubscribers: 'alert-subscribers',
  policies: 'policies',
  documentation: 'documentation',
  users: 'users',
};

/**
 * Grouped admin sidebar. Subheadings keep every option visible.
 * Connectors own all credential/integration panels; Alerts manages subscriber prefs.
 *
 * `icon` is a lucide icon name resolved in AdminSidebarNav.
 */
export const ADMIN_NAV_GROUPS = [
  {
    id: 'home',
    label: null,
    items: [
      {
        id: ADMIN_SECTION_IDS.overview,
        label: 'Dashboard',
        hint: 'At-a-glance status and shortcuts',
        icon: 'LayoutDashboard',
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        id: ADMIN_SECTION_IDS.usage,
        label: 'API usage',
        hint: 'Daily OpenWeather quota and endpoint breakdown',
        icon: 'Activity',
      },
      {
        id: ADMIN_SECTION_IDS.platform,
        label: 'Platform limits',
        hint: 'Saved-city caps and public platform controls',
        icon: 'Gauge',
      },
      {
        id: ADMIN_SECTION_IDS.locations,
        label: 'Location history',
        hint: 'Stored location checks and history',
        icon: 'History',
      },
      {
        id: ADMIN_SECTION_IDS.inaccuracies,
        label: 'Inaccuracy issues',
        hint: 'Active weather accuracy reports',
        icon: 'AlertTriangle',
      },
    ],
  },
  {
    id: 'connectors',
    label: 'Connectors',
    items: [
      {
        id: ADMIN_SECTION_IDS.weatherApi,
        label: 'Weather API',
        hint: 'OpenWeather key, refresh interval, and limits',
        icon: 'CloudSun',
      },
      {
        id: ADMIN_SECTION_IDS.adsense,
        label: 'AdSense',
        hint: 'Publisher ID, slots, and earnings',
        icon: 'BadgePoundSterling',
      },
      {
        id: ADMIN_SECTION_IDS.emailConnectors,
        label: 'Email',
        hint: 'Resend, SendGrid, and SES credentials',
        icon: 'Mail',
      },
      {
        id: ADMIN_SECTION_IDS.alertConnectors,
        label: 'Alert feeds',
        hint: 'Open-Meteo warnings and US NWS alerts',
        icon: 'Radar',
      },
    ],
  },
  {
    id: 'email',
    label: 'Email',
    items: [
      {
        id: ADMIN_SECTION_IDS.emailTemplates,
        label: 'Templates',
        hint: 'Edit transactional email HTML',
        icon: 'FileText',
      },
      {
        id: ADMIN_SECTION_IDS.newsletter,
        label: 'Newsletter',
        hint: 'Platform newsletter signups',
        icon: 'Newspaper',
      },
      {
        id: ADMIN_SECTION_IDS.weeklyDigests,
        label: 'Weekly digests',
        hint: 'City weekly digest subscribers',
        icon: 'CalendarDays',
      },
    ],
  },
  {
    id: 'alerts',
    label: 'Alerts',
    items: [
      {
        id: ADMIN_SECTION_IDS.alertSubscribers,
        label: 'Subscribers',
        hint: 'Per-location alert type preferences',
        icon: 'Bell',
      },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    items: [
      {
        id: ADMIN_SECTION_IDS.policies,
        label: 'Policies',
        hint: 'Privacy, terms, cookies, accessibility',
        icon: 'Scale',
      },
      {
        id: ADMIN_SECTION_IDS.documentation,
        label: 'Documentation',
        hint: 'Public /docs pages',
        icon: 'BookOpen',
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      {
        id: ADMIN_SECTION_IDS.users,
        label: 'Users',
        hint: 'Admin accounts and profile',
        icon: 'Users',
      },
    ],
  },
];

/** Flat list for overview grids and id lookups. */
export const ADMIN_SECTIONS = ADMIN_NAV_GROUPS.flatMap((group) => group.items);

export function getAdminSection(sectionId) {
  return ADMIN_SECTIONS.find((section) => section.id === sectionId) ?? null;
}

/** Redirect legacy section ids after nav reorganisation. */
export const ADMIN_SECTION_ALIASES = {
  'weather-alerts': ADMIN_SECTION_IDS.alertSubscribers,
  subscribers: ADMIN_SECTION_IDS.newsletter,
};

export const INACCURACY_AUTO_DISMISS_DAY_OPTIONS = [
  { label: '1 day', value: 1 },
  { label: '3 days', value: 3 },
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];
