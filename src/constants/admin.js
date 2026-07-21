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
  observability: 'observability',
  weatherApi: 'weather-api',
  adsense: 'adsense',
  emailConnectors: 'email-connectors',
  alertConnectors: 'alert-connectors',
  emailDashboard: 'email-dashboard',
  mailingLists: 'mailing-lists',
  emailTemplates: 'email-templates',
  emailSettings: 'email-settings',
  /** Legacy — aliased to emailTemplates */
  authEmails: 'auth-emails',
  /** Legacy — aliased to emailTemplates */
  adminEmails: 'admin-emails',
  newsletter: 'newsletter',
  weeklyDigests: 'weekly-digests',
  alertSubscribers: 'alert-subscribers',
  policies: 'policies',
  documentation: 'documentation',
  blog: 'blog',
  placeGuides: 'place-guides',
  profile: 'profile',
  users: 'users',
};

/**
 * Grouped admin sidebar. Subheadings keep every option visible.
 * Connectors own credential/integration panels; Email owns mailing
 * analytics, rosters, templates, and digest defaults.
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
        hint: 'Analytics, API use, email lists, and AdSense',
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
        hint: 'Maximum saved cities per device',
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
      {
        id: ADMIN_SECTION_IDS.observability,
        label: 'Error log',
        hint: 'Errors, cron runs, email sends, admin audit',
        icon: 'ScrollText',
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
        hint: 'Resend, SendGrid, SES, and SMTP credentials',
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
        id: ADMIN_SECTION_IDS.emailDashboard,
        label: 'Dashboard',
        hint: 'Mailing list sizes and popularity',
        icon: 'LayoutDashboard',
      },
      {
        id: ADMIN_SECTION_IDS.mailingLists,
        label: 'Mailing Lists',
        hint: 'Newsletter, weekly digests, and alert subscriber rosters',
        icon: 'Newspaper',
      },
      {
        id: ADMIN_SECTION_IDS.emailTemplates,
        label: 'Email Templates',
        hint: 'Mailing, auth, and admin reply templates with preview',
        icon: 'FileText',
      },
      {
        id: ADMIN_SECTION_IDS.emailSettings,
        label: 'Settings',
        hint: 'Digest frequency defaults and mailing preferences',
        icon: 'Settings',
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
      {
        id: ADMIN_SECTION_IDS.blog,
        label: 'Blog Articles',
        hint: 'Public /journal posts',
        icon: 'Newspaper',
      },
      {
        id: ADMIN_SECTION_IDS.placeGuides,
        label: 'Place guides',
        hint: 'Auto-generated /weather location guides',
        icon: 'MapPin',
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      {
        id: ADMIN_SECTION_IDS.profile,
        label: 'Profile',
        hint: 'Your display name, email, and password',
        icon: 'UserRound',
      },
      {
        id: ADMIN_SECTION_IDS.users,
        label: 'Users',
        hint: 'Invite and manage admin accounts',
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
  'weather-alerts': ADMIN_SECTION_IDS.mailingLists,
  'alert-subscribers': ADMIN_SECTION_IDS.mailingLists,
  subscribers: ADMIN_SECTION_IDS.mailingLists,
  newsletter: ADMIN_SECTION_IDS.mailingLists,
  'weekly-digests': ADMIN_SECTION_IDS.mailingLists,
  'auth-emails': ADMIN_SECTION_IDS.emailTemplates,
  'admin-emails': ADMIN_SECTION_IDS.emailTemplates,
};

export const WEEKLY_DIGEST_FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
];

export const WEEKLY_DIGEST_DAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const INACCURACY_AUTO_DISMISS_DAY_OPTIONS = [
  { label: '1 day', value: 1 },
  { label: '3 days', value: 3 },
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];
