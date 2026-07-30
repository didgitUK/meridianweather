/**
 * Featured meridian journal posts — seed defaults for the Blog Articles CMS.
 * Image URLs are verified Unsplash 16:9 crops (must return HTTP 200).
 */

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
      'City cards and detail pages reuse fetched snapshots where possible. Manual refresh is available when you know conditions changed; background polls stay conservative so free-tier call budgets last through the day.',
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
  {
    id: 'uk-atlantic-fronts',
    title: 'Reading Atlantic fronts on a UK forecast',
    excerpt:
      'Most British wet spells arrive from the west. Here is how to spot fronts on meridian’s hourly and daily strips without over-reading a single icon.',
    category: 'Guides',
    dateLabel: '29 Jul 2026',
    dateIso: '2026-07-29',
    href: '/journal/uk-atlantic-fronts',
    imageUrl:
      'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Clouds moving over green hills under a wide sky',
    body: Object.freeze([
      'In the UK, many “bad weather days” are simply Atlantic fronts sweeping east. Temperature may barely change while wind and rain chance jump — that is the signal, not a failed forecast.',
      'On meridian, scan the hourly precipitation and gust columns first when a front is due. A dry morning with rising wind often precedes the rain band; the daily high alone will not tell you that story.',
      'Coastal and western places usually see the wettest part sooner than eastern inland towns. If you are comparing two pinned cities, look at timing offsets rather than assuming the same hour looks identical.',
      'After the front, clearer breaks are common. Refresh closer to your outdoor window instead of locking plans to yesterday’s day-nine outlook.',
    ]),
  },
  {
    id: 'sea-breezes-and-coasts',
    title: 'Sea breezes, haar, and why coasts feel different',
    excerpt:
      'Coastal UK places often run cooler by day and milder by night than inland peers. Use that context when reading Meridian place pages.',
    category: 'Guides',
    dateLabel: '28 Jul 2026',
    dateIso: '2026-07-28',
    href: '/journal/sea-breezes-and-coasts',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Sandy beach with gentle waves under soft light',
    body: Object.freeze([
      'Sea breezes can drop afternoon temperatures along coasts even when inland cities stay warm. Meridian shows the lat/lon forecast OpenWeather returns — it will not invent a beach microclimate beyond that point.',
      'Haar and low cloud along eastern and northern coasts can wipe sunshine without a dramatic rain spike. When the condition text says mist or fog, trust the sky icon over a mild temperature alone.',
      'Gusts on promenades and bridges feel stronger than the same number in a sheltered street. If wind is your constraint, check gusts on the hourly strip before ferry decks or cliff walks.',
      'Our hot UK place blurbs call out coastal quirks where they matter; the live numbers below them remain the decision tool.',
    ]),
  },
  {
    id: 'pennines-rain-shadow',
    title: 'West vs east of the Pennines: rain shadows in practice',
    excerpt:
      'Manchester and Leeds can disagree on the same day. Here is how UK topography shows up in two pinned Meridian cities.',
    category: 'Guides',
    dateLabel: '27 Jul 2026',
    dateIso: '2026-07-27',
    href: '/journal/pennines-rain-shadow',
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Mountain ridge under layered clouds',
    body: Object.freeze([
      'Western approaches to the Pennines often catch more rain; eastern lowlands can stay drier on the same Atlantic feed. That is geography, not a bug in the app.',
      'Pin both a western and an eastern city when you travel across the hills. Compare hourly rain chance rather than daily totals if you need a dry driving window.',
      'When fronts stall, the “dry side” can still see drizzle. Meridian will not smooth those differences away — refresh each place if the journey crosses the range.',
      'Use place pages for context, then decide from the live hourly strip. Do not plan a Peak District walk from a single city card alone.',
    ]),
  },
  {
    id: 'summer-convective-showers',
    title: 'Summer showers: probability vs a ruined picnic',
    excerpt:
      'A 40% chance of rain is not a coin flip for your afternoon. How to read convective risk on meridian without cancelling everything.',
    category: 'Guides',
    dateLabel: '26 Jul 2026',
    dateIso: '2026-07-26',
    href: '/journal/summer-convective-showers',
    imageUrl:
      'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Sunlit clouds with a distant rain shaft',
    body: Object.freeze([
      'Convective showers are hit-and-miss: one suburb soaks while another stays dry. Probability describes ensemble likelihood, not a guarantee that rain falls on your postcode.',
      'Pair probability with intensity and timing. Light showers at 20% rarely stop a park visit; heavy cells at 50% in your exact hour might.',
      'On meridian, prefer the next four to six hours when deciding whether to leave now. The daily “chance of rain” alone is too coarse for a picnic window.',
      'If plans are flexible, wait for a clearer slot after the peak convective period rather than abandoning the day at the first yellow icon.',
    ]),
  },
  {
    id: 'winter-clear-nights',
    title: 'Clear winter nights, frost, and morning ice',
    excerpt:
      'When the sky clears after a cold front, overnight lows matter more than the afternoon high. A short Meridian checklist for UK winters.',
    category: 'Guides',
    dateLabel: '25 Jul 2026',
    dateIso: '2026-07-25',
    href: '/journal/winter-clear-nights',
    imageUrl:
      'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Frosted landscape under a pale winter sky',
    body: Object.freeze([
      'Clear nights radiate heat quickly. A mild afternoon can still produce frost by morning if wind drops and skies open — common after cold fronts in the UK.',
      'Check overnight lows and the early hourly columns before an early commute. Road surface ice is about the coldest hours, not yesterday’s high.',
      'Urban heat islands keep city centres a little milder than surrounding villages. If you pin both, expect the rural overnight to run colder.',
      'Meridian does not replace local travel advisories; it gives you the temperature trend so you know when to look for them.',
    ]),
  },
  {
    id: 'heat-and-urban-nights',
    title: 'Warm spells and why cities cool slowly overnight',
    excerpt:
      'Urban heat keeps nights sticky after hot UK days. How to use Meridian’s overnight strip when planning sleep and travel.',
    category: 'Guides',
    dateLabel: '24 Jul 2026',
    dateIso: '2026-07-24',
    href: '/journal/heat-and-urban-nights',
    imageUrl:
      'https://images.unsplash.com/photo-1504370806028-c95aa8955adc?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'City skyline in warm evening light',
    body: Object.freeze([
      'Concrete and traffic store heat. London and other large UK cities often stay warmer overnight than surrounding countryside during heatwaves.',
      'On meridian, read the overnight hourly temperatures — not only the daytime max — if you care about sleep comfort or early starts.',
      'UV and afternoon peaks still matter for outdoor work; pair them with wind, which can make heat feel less stagnant even when the thermometer stays high.',
      'We stay within OpenWeather’s free-tier detail. For health warnings, follow Met Office and local authority guidance alongside any app.',
    ]),
  },
  {
    id: 'packing-for-uk-weekends',
    title: 'Packing for a UK weekend with a 10-day ribbon',
    excerpt:
      'Use near-term hours for Saturday morning decisions and the longer ribbon only for packing bands — not for booking the exact hour of rain.',
    category: 'Forecasts',
    dateLabel: '23 Jul 2026',
    dateIso: '2026-07-23',
    href: '/journal/packing-for-uk-weekends',
    imageUrl:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Open travel bag with clothes on a wooden floor',
    body: Object.freeze([
      'Pack for temperature bands and rain likelihood, not for a single icon five days out. UK weekends often flip after a midweek model update.',
      'On meridian, lock waterproof and layers from the daily ribbon; lock leave-time from the hourly strip within 24–48 hours of travel.',
      'If two destinations disagree, pack for the wetter and windier of the pair. It is easier to shed a layer than to invent a coat.',
      'Refresh the place page the evening before you go. Free-tier forecasts improve as the event approaches — that is expected, not a failure of earlier views.',
    ]),
  },
  {
    id: 'wind-gusts-bridges',
    title: 'Gusts, bridges, and exposed walks',
    excerpt:
      'Sustained wind and gusts are different decisions. When Meridian’s gust column should override a mild temperature.',
    category: 'Guides',
    dateLabel: '22 Jul 2026',
    dateIso: '2026-07-22',
    href: '/journal/wind-gusts-bridges',
    imageUrl:
      'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Windswept clouds over an open landscape',
    body: Object.freeze([
      'A light breeze with sharp gusts feels worse on bridges, piers, and ridges than the average wind speed suggests. Cyclists and pushchairs notice first.',
      'Meridian surfaces gusts where the upstream feed provides them. If gusts spike in your hour window, treat that as a harder constraint than a friendly sky icon.',
      'Coastal and estuary places amplify gusts. Compare your inland pin with the coastal pin before committing to an exposed path.',
      'If gust data is missing for a scope, do not invent it — use the available wind field and local knowledge, or wait for a refresh.',
    ]),
  },
  {
    id: 'fog-and-visibility',
    title: 'Fog, mist, and low visibility mornings',
    excerpt:
      'Mild temperatures can still mean poor visibility. How fog shows up in condition text and why travel timing matters.',
    category: 'Guides',
    dateLabel: '21 Jul 2026',
    dateIso: '2026-07-21',
    href: '/journal/fog-and-visibility',
    imageUrl:
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Misty hills at dawn',
    body: Object.freeze([
      'Fog is a visibility problem more than a temperature problem. Drivers and runners should read condition wording and sky icons for mist or fog even when the thermometer looks fine.',
      'Valley towns and coasts can hold fog after hills clear. If you pin both, expect timing differences on the same morning.',
      'Meridian does not replace highway or aviation visibility products. Use it as a heads-up to check official travel advice before early starts.',
      'As sun rises, fog often lifts — the hourly strip helps you see whether your departure sits inside or after that window.',
    ]),
  },
  {
    id: 'free-tier-honesty',
    title: 'What “free tier” means for Meridian forecasts',
    excerpt:
      'We share an OpenWeather budget, cache aggressively, and refuse to pretend unpaid upstream feeds are premium model suites.',
    category: 'Product',
    dateLabel: '20 Jul 2026',
    dateIso: '2026-07-20',
    href: '/journal/free-tier-honesty',
    imageUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Abstract network globe visualization',
    body: Object.freeze([
      'Meridian’s public demo runs on OpenWeather’s free tier with server-side caching and daily call budgets. That keeps costs honest and protects the key from accidental abuse.',
      'You may see soft-stale data when budgets are tight, or fewer high-resolution hours than a paid meteorology workstation would show. We surface that reality in product copy instead of hiding it.',
      'SEO place pages share the same upstream discipline: hot places refresh more often; cold places wait for a hit. That is intentional quota design, documented in our ops notes.',
      'If you self-host Meridian for heavier traffic, start with your own API key and stronger cache — not by removing rate-limit awareness from the code.',
    ]),
  },
  {
    id: 'consent-and-ads',
    title: 'Consent, AdSense, and what loads in your browser',
    excerpt:
      'Advertising scripts stay off until you opt in. Here is how Meridian separates essential storage from optional ads and analytics.',
    category: 'Product',
    dateLabel: '19 Jul 2026',
    dateIso: '2026-07-19',
    href: '/journal/consent-and-ads',
    imageUrl:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Laptop showing privacy-related settings UI',
    body: Object.freeze([
      'Essential browser storage keeps your pinned cities and preferences. Functional consent enables weather cache in localStorage so refreshes are cheaper.',
      'Analytics and advertising are optional. Google AdSense runtime code loads only after advertising consent — verification meta tags are separate from ad serving.',
      'You can reject advertising and still use forecasts. When Stripe billing is configured, Settings offers an ad-free path instead of forcing ads.',
      'We would rather show empty or branded slots than load trackers without a clear yes. That is a product choice, not a temporary demo quirk.',
    ]),
  },
  {
    id: 'using-place-pages',
    title: 'How to use a /weather place page well',
    excerpt:
      'Place pages combine live forecast chrome with local context. What to trust, what is optional, and what we refuse to auto-publish.',
    category: 'Product',
    dateLabel: '18 Jul 2026',
    dateIso: '2026-07-18',
    href: '/journal/using-place-pages',
    imageUrl:
      'https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Map with location pins',
    body: Object.freeze([
      'The top of a place page is the forecast: conditions, hourly detail, and the longer outlook for that lat/lon. Start there for any go/no-go decision.',
      'Below the fold you may see OpenStreetMap things to do and, when we have published one, an original Meridian guide. OSM names are third-party map data; guides are Meridian writing.',
      'We do not publish stub filler articles that repeat the same paragraph to hit a word count. Draft generation may exist for operators; public publish requires human review.',
      'If a place feels thin, use search to open the live city view and pin it — the dashboard remains the fastest path for places you check daily.',
    ]),
  },
  {
    id: 'install-pwa',
    title: 'Installing Meridian as an app on your phone',
    excerpt:
      'Meridian is a progressive web app: install from the browser for a full-screen weather shell and offline backup of pinned places.',
    category: 'Product',
    dateLabel: '17 Jul 2026',
    dateIso: '2026-07-17',
    href: '/journal/install-pwa',
    imageUrl:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Hand holding a smartphone showing an app home screen',
    body: Object.freeze([
      'On supported browsers, use Install app / Add to Home Screen. You get a standalone window without the browser chrome cluttering the forecast.',
      'Pinned places stay in local storage on that device. Installing does not create a Meridian account; clearing site data still clears pins.',
      'When Web Push is configured, a daily refresh can nudge the installed app — optional, and subject to browser permission.',
      'Native App Store / Play Store listings are not required for the PWA path. Use the footer install hint if your browser hides the prompt.',
    ]),
  },
]);
