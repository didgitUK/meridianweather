export const cookiesPolicy = {
  slug: 'cookies',
  title: 'Cookie Policy',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      body:
        'Website Servers Ltd trading as meridian uses cookies and similar technologies (including localStorage and sessionStorage) on meridianweather.co.uk. This Cookie Policy explains what we store, why, and how you can control it under the UK Privacy and Electronic Communications Regulations (PECR) and UK GDPR.\n\nController details match our Privacy Policy: Website Servers Ltd, company number 17240780, registered office Orchard Cottage, Beck Orchard, Brampton, United Kingdom, CA8 1UR. Contact: privacy@meridianweather.co.uk.\n\nmeridian relies primarily on first-party browser storage rather than first-party advertising cookies. Third-party cookies may be set by Google when you enable advertising or analytics consent and those products are configured.',
    },
    {
      id: 'what-we-use',
      title: 'What we use',
      body:
        'Essential / operation: anonymous client ID; consent state; banner acknowledgement; theme, locale, temperature unit, accessibility preferences, and similar settings needed to remember how you use the site; saved cities and recent lookups you request; local subscription preference mirror.\n\nFunctional (optional): weather payload cache writes to localStorage and precise browser geolocation when you allow them — controlled by the functional consent category.\n\nAdvertising (optional): Google AdSense script and related Google cookies or identifiers when advertising consent is on and AdSense is configured. Ad-slot view events in our first-party analytics also require advertising consent.\n\nAnalytics (optional): Google Analytics (GA4) when analytics consent is on and a measurement ID is configured. Separately, a first-party analytics beacon may record page path, engaged time, and scroll depth in our own database using a session ID in sessionStorage when analytics consent is on (not a classic third-party tracking cookie).\n\nMarketing email consent is reserved in preferences and is not used to send promotional mail beyond subscription types you explicitly opt into.',
    },
    {
      id: 'local-storage',
      title: 'First-party storage keys',
      body:
        'meridian:client-id — anonymous UUID linking optional email subscriptions to this browser.\n\nmeridian:saved-cities — cities you pin (up to ten).\n\nmeridian:checked-cities — recent city lookups.\n\nmeridian:user-location — home / region profile and related history.\n\nmeridian:weather-cache — cached weather payloads (functional writes).\n\nmeridian:theme, meridian:temperature-unit, meridian:preferred-locale, meridian:accessibility, meridian:weather-refresh-mode, meridian:city-detail-accordion — display and accessibility preferences.\n\nmeridian:consent — JSON consent categories (essential, functional, marketing, analytics, advertising).\n\nmeridian:cookie-consent — legacy banner acknowledgement flag.\n\nmeridian:subscriptions — local mirror of email preferences.\n\nmeridian:tier — reserved (product currently operates as free).\n\nsessionStorage meridian_analytics_sid — first-party analytics session identifier.\n\nDevice-only journal comment keys may exist for demo journal posts.\n\nStaff only: an HttpOnly meridian_admin_session cookie authenticates the admin console; it is not used for public marketing.',
    },
    {
      id: 'consent-categories',
      title: 'Consent categories',
      body:
        'essential — always on; required for core service memory and security-related identifiers.\n\nfunctional — weather cache localStorage writes and precise GPS / location helpers you choose; withdrawing functional consent clears related functional stores where the product implements cleanup.\n\nadvertising — loads Google AdSense when configured; also required for first-party ad-slot view events.\n\nanalytics — loads Google Analytics (GA4) when configured and enables the first-party analytics beacon.\n\nmarketing — reserved / not used for separate marketing pixels in the current product.\n\nThe first visit cookie banner offers Essential only, Accept functional, Accept all, or Manage preferences. You can reopen preferences any time from the floating Settings control. “Accept all” enables functional and advertising; turn on analytics (beacon + GA4) separately in preferences if offered.',
    },
    {
      id: 'third-party',
      title: 'Third-party cookies',
      body:
        'When advertising consent is granted and AdSense is live, Google may set cookies or use similar technologies under Google’s policies (including ads personalisation settings you control in your Google account where available).\n\nWhen analytics consent is granted and GA4 is configured, Google Analytics may set its own cookies.\n\nWe do not control the full cookie set of those third parties. Review Google’s privacy and ad settings alongside this policy.',
    },
    {
      id: 'withdraw',
      title: 'How to withdraw or clear',
      body:
        'Open the site Settings control and use Cookie preferences to change categories or reject non-essential items. You can also clear site data for meridianweather.co.uk in your browser.\n\nDisabling advertising stops our AdSense script on subsequent loads. Disabling analytics stops our GA loader (when configured) and our first-party analytics beacon. Clearing storage removes local cities and preferences until you set them again.\n\nFor questions or PECR / GDPR requests involving cookies: privacy@meridianweather.co.uk.',
    },
  ],
};
