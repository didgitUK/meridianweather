/**
 * Featured meridian journal posts — static for v1 (no CMS).
 * Image URLs are verified Unsplash 16:9 crops (must return HTTP 200).
 */

import {
  getLocalizedBlogPost,
  getLocalizedBlogPosts,
} from '@/constants/blog-posts-i18n';

export const HOME_BLOG_POSTS = Object.freeze([
  {
    id: 'reading-hourly-forecasts',
    title: 'How to read an hourly forecast without second-guessing',
    excerpt:
      'Temperature, rain chance, and wind gusts arrive every hour — here is what matters first when you are planning the afternoon.',
    category: 'Guides',
    dateLabel: '12 Jul 2026',
    dateIso: '2026-07-12',
    href: '/journal/reading-hourly-forecasts',
    imageUrl:
      'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Sunlight breaking through clouds over a coastal landscape',
    body: Object.freeze([
      'An hourly strip looks busy at first glance: every column stacks temperature, sky icon, precipitation chance, and often wind. The trick is to decide what the afternoon is for — outdoor time, travel, or staying put — then read only the columns that change that plan.',
      'Start with precipitation probability and intensity together. A 40% chance of light drizzle rarely ruins a walk; the same chance with heavy showers might. Next, check temperature trend across the next four to six hours rather than a single peak: cooling after a warm midday matters more for evening plans than the absolute high.',
      'Wind gusts are the third filter. Sustained breeze feels different from sharp gusts when cycling or walking exposed shorelines. On meridian, scan the densified next-hour row first, then the wider hourly tab if you need a longer window.',
      'If numbers still feel noisy, pick one decision — leave by 3pm or wait until later — and ask whether any hour after now clearly breaks that decision. Most of the rest can stay unread.',
    ]),
  },
  {
    id: 'ten-day-outlook',
    title: 'What a 10-day outlook can — and cannot — tell you',
    excerpt:
      'Confidence fades the further out you look. Learn how meridian presents near-term detail versus estimated days beyond OpenWeather’s free window.',
    category: 'Forecasts',
    dateLabel: '10 Jul 2026',
    dateIso: '2026-07-10',
    href: '/journal/ten-day-outlook',
    imageUrl:
      'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Lightning storm over a city skyline at night',
    body: Object.freeze([
      'A 10-day view is useful for travel packing and weekend planning, but it is not a contract. Models agree more on day two than on day nine, and free-tier upstream feeds often stop short of a full decade of high-resolution daily rows.',
      'On meridian, near-term days carry richer detail from the One Call feed. Days further out may use an extended daily horizon that fills the calendar for structure while staying honest about what OpenWeather’s free window actually returns.',
      'Treat the far end as a direction of travel: warmer or cooler than today, wetter pattern or not — not as precise shower timing. Refresh closer to the date when the plan turns into a booking.',
      'City detail keeps Today, Hourly, and Daily tabs separate so you can zoom into confidence you can use, then step back to the longer ribbon when you only need a rough sense of the week ahead.',
    ]),
  },
  {
    id: 'pinning-locations',
    title: 'Pinning the cities that matter on your dashboard',
    excerpt:
      'Check any place worldwide, save a short list locally, and keep live conditions within one glance — no account required.',
    category: 'Product',
    dateLabel: '8 Jul 2026',
    dateIso: '2026-07-08',
    href: '/journal/pinning-locations',
    imageUrl:
      'https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Travel map with pins marking cities',
    body: Object.freeze([
      'Meridian is built for a short list of places you actually care about — home, office, family, next trip — not a second weather social feed. Search any city worldwide, open the detail page, and pin it back to Your Locations.',
      'Pins live in your browser via localStorage. That keeps the exercise honest for the free-tier demo: no account wall, and your list returns after a reload on the same device. Clearing site data clears pins; that is intentional for this stack.',
      'Recent checks sit beside pins so one-off lookups do not clutter the saved board. Use Allow Location on the hero when you want the dashboard centred on where you are now, then pin anything else that should stay visible.',
      'If a card looks stale, refresh that city rather than the whole page — we cache with rate limits in mind so the shared OpenWeather key survives a demo day.',
    ]),
  },
  {
    id: 'alerts-digests',
    title: 'Email digests and severe weather alerts, explained',
    excerpt:
      'Weekly summaries for calm weeks, location alerts when thresholds break — how meridian uses free-tier email without flooding your inbox.',
    category: 'Alerts',
    dateLabel: '5 Jul 2026',
    dateIso: '2026-07-05',
    href: '/journal/alerts-digests',
    imageUrl:
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Mountain ridge under dramatic storm light',
    body: Object.freeze([
      'Not every inbox wants a midday pulse. Meridian separates calm digests from threshold-driven alerts so you can subscribe for a weekly summary without signing up for storm theatre every afternoon.',
      'Digests gather a short outlook for places you follow. Alerts fire when configured conditions — rain, wind, temperature bands — cross lines you care about, using the same evaluation path as the admin weather-check cron.',
      'Free-tier email providers have send ceilings. Templates stay lightweight, shortcodes fill location-specific weather vars, and connectors are managed from the admin email panel so demos can swap SMTP or API keys without rewriting product pages.',
      'Unsubscribe and preference honesty matter as much as the content: if alerts feel noisy, lower thresholds or pause the mailing list rather than abandoning the product.',
    ]),
  },
  {
    id: 'rate-limits',
    title: 'Staying inside OpenWeather’s free-tier limits',
    excerpt:
      'Caching, refresh windows, and why meridian avoids hammering upstream on every tab click — practical rates for a shared demo key.',
    category: 'Engineering',
    dateLabel: '2 Jul 2026',
    dateIso: '2026-07-02',
    href: '/journal/rate-limits',
    imageUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Abstract globe and data network visualization',
    body: Object.freeze([
      'OpenWeather’s free tier is generous for a focused demo and fragile if every hover becomes a network call. Meridian treats the key as a shared budget: cache weather payloads, debounce refreshes, and prefer local formatting when the user only changes units or tabs.',
      'City cards and detail pages reuse fetched snapshots where possible. Manual refresh is available when you know conditions changed; background polls stay conservative so a classroom of interviewers does not exhaust the daily allotment before lunch.',
      'Geocode and One Call endpoints count separately in practice — search typos should not cost a full weather pull. Failed upstream responses surface as honest UI errors instead of silent retries in a loop.',
      'If you fork the project for heavier traffic, the first upgrades are a private key, stronger server cache, and dialling back showcase prefetch — not removing the rate-limit awareness that shaped this code.',
    ]),
  },
  {
    id: 'weather-icons',
    title: 'From OpenWeather codes to Meteocons on meridian',
    excerpt:
      'Why local SVG weather icons load faster, how condition and metric icons map, and what you see when upstream symbols change.',
    category: 'Design',
    dateLabel: '28 Jun 2026',
    dateIso: '2026-06-28',
    href: '/journal/weather-icons',
    imageUrl:
      'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Rain falling on a city street with an umbrella',
    body: Object.freeze([
      'Upstream icon codes are useful keys, not the artwork. Meridian maps OpenWeather condition IDs to local Meteocon-style SVGs so cards stay sharp on retina screens and keep working offline once assets are cached.',
      'Condition icons (clear, rain, thunder) sit beside metric glyphs for humidity, wind, UV, and pressure. Keeping both families in `/public/weather-icons` avoids a third-party CDN hop on every city card.',
      'When OpenWeather adds or renames codes, the mapping layer is the single place to update — UI components keep consuming a stable local name. Missing codes fall back to a neutral cloudy mark rather than a broken image.',
      'The goal is glanceable weather in the same visual language across hero, grid, and city detail — not pixel-perfect clones of OpenWeather’s raster sprites.',
    ]),
  },
]);

/**
 * @param {string | null | undefined} [locale]
 */
export function getBlogPosts(locale) {
  return getLocalizedBlogPosts(locale) ?? HOME_BLOG_POSTS;
}

/**
 * @param {string} id
 * @param {string | null | undefined} [locale]
 */
export function getBlogPostById(id, locale) {
  const localized = getLocalizedBlogPost(locale, id);
  if (localized) {
    return localized;
  }

  return HOME_BLOG_POSTS.find((post) => post.id === id) ?? null;
}

export function getBlogPostIds() {
  return HOME_BLOG_POSTS.map((post) => post.id);
}
