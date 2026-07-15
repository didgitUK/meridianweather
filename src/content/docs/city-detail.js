export const cityDetailDoc = {
  slug: 'city-detail',
  title: 'City detail',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'access',
      title: 'Who can view a city page',
      body:
        'City detail pages live at /city/[cityId]. resolveCity() always serves the five PLATFORM_SHOWCASE_CITIES (London, Dubai, New York, Tokyo, Sydney). Any location row with a city_slug also resolves. Parsed IDs of the form {name}-{country}-{lat} match when lat/country exist in SQLite. Unknown or malformed slugs return 404. You do not need to pin a city to open its page.',
    },
    {
      id: 'tabs',
      title: 'Forecast tabs',
      body:
        'Sticky tabs: Today, Hourly, 10-Day, and History. Deep-link with ?tab=hourly, ?tab=daily, or ?tab=history. Legacy ?tab=next-hour redirects to Today. Up to three OpenWeather alert banners render above the hero when alertIds are present. A city-detail AdSlot sits directly under the tabs.',
    },
    {
      id: 'header',
      title: 'Page header and hero',
      body:
        'By default the header uses an OSM satellite map backdrop when isCityHeroOsmEnabled() is true (NEXT_PUBLIC_CITY_HERO_OSM unset or not "0"). Set NEXT_PUBLIC_CITY_HERO_OSM=0 to prefer photos. Photo mode cascades Unsplash → Wikimedia Commons → Pexels via getHeroImageForRegion, with static SVG fallbacks when keys are missing. Optional Google Street View applies when OSM is off and NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1.',
    },
    {
      id: 'today',
      title: 'Today tab',
      body:
        'Current conditions hero, metric tiles with Meteocon icons, and Current conditions / Location / Sun times accordions. Hourly preview for the rest of today when hourly data is available.',
    },
    {
      id: 'hourly',
      title: 'Hourly tab',
      body:
        'Next-12-hour card list (one column) for near-term temperature, precipitation chance, and wind.',
    },
    {
      id: 'daily',
      title: '10-Day tab',
      body:
        'Daily outlook list (up to ten days): weekday, icon, description/summary, min/max, rain chance, wind, UV. Selecting a day opens the metric chart for that date.',
    },
    {
      id: 'history',
      title: 'History tab',
      body:
        'Past days from stored observations and archived forecasts via GET /api/weather/history, with day picker and chart.',
    },
    {
      id: 'alerts',
      title: 'Weather alerts',
      body:
        'When OpenWeather returns alerts, AlertBanner shows at most three above the hero. Full alert text is available via GET /api/alerts/[alertId].',
    },
    {
      id: 'data',
      title: 'Data loading',
      body:
        'SSR hydrates current, daily, and hourly when available from getCityWeatherForSeo. The client hook useCityWeather batch-fetches DETAIL_SCOPES = [current, hourly, daily] via POST /api/weather/batch — minutely is not requested. Premium / MinutelyPrecipStrip is not wired.',
    },
    {
      id: 'subscribe',
      title: 'Pin and subscribe',
      body:
        'The Options menu on the header provides Pin to your locations and Subscribe (weekly digest + weather alerts) — the same flows as dashboard cards. Pin saves to meridian:saved-cities; subscribe opens SubscribeDialog.',
    },
    {
      id: 'prefetch',
      title: 'Prefetch',
      body:
        'Hovering a dashboard weather card prefetches /city/[cityId] and warms L0 cache via prefetchCityDetail so detail pages open faster.',
    },
    {
      id: 'seo',
      title: 'Search and discovery',
      body:
        'When a location receives its first successful current-weather check, markLocationIndexable sets city_slug and indexable_at, adds the city to the sitemap, and server-renders SEO metadata plus a summary block on the city page.',
    },
  ],
};
