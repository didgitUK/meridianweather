# meridian — Backend study sheet (interview)

Rehearse this before the interview demo. Binding scope: [`SCOPE.md`](../SCOPE.md). Architecture detail: [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Interview cue card (≤1 screen)

Memorize these short answers; they match what SCOPE §5 says you should discuss.

| Question | Answer |
| --- | --- |
| Why API routes? | OpenWeather key stays on the server; the browser only hits `/api/weather` and `/api/geocode`. |
| Why localStorage *and* SQLite? | **localStorage** holds the user’s pinned city list (brief requirement). **SQLite** (+ memory) is shared server cache and quota accounting so we don’t burn the free tier. |
| Why caching + manual refresh? | Free tier is ~**1000 calls/day**. L0/L1/L2 reuse snapshots; default refresh is **manual** so a page reload doesn’t force upstream. |
| How do you show errors? | Rename/blank `OPENWEATHER_API_KEY` and retry a card, or DevTools → Offline. Cards show an Alert + Retry; search soft-falls when appropriate. |
| What about admin / email / ads? | Stretch exploration. Evaluation focus is the **weather dashboard** brief — search → pin → cards. |

Elevator (30s): Next.js API routes proxy OpenWeather so the key never hits the browser. Cities live in localStorage. Shared cache + quota protect the free tier. Manual refresh keeps demos cheap.

## Core vs stretch

| Keep for demo | Freeze (don’t expand; optional env) |
| --- | --- |
| Search, pin/unpin, cards, localStorage | Admin, email/cron, AdSense live, CMS |
| `/api/weather`, `/batch`, `/api/geocode` | PWA polish, CMS product work |
| Cache + quota (`lib/weather/*`) | Recent-checks seed as product |

Interview line: “Stretch exists as exploration; evaluation focus is the dashboard brief.”

## Request lifecycle — Add London

1. Search → `GET /api/geocode?q=London` (popular-city soft-fallback if key/quota fails)
2. Open city detail → **Pin** → `meridian:saved-cities` in localStorage
3. Dashboard → `POST /api/weather/batch`
4. Server: L1 memory → L2 SQLite → quota gate → OpenWeather strategies → persist
5. Client also keeps L0 `meridian:weather-cache`
6. Card renders temp / description / icon (+ detail has humidity/wind)

## Error handling

| Case | User sees |
| --- | --- |
| Bad / missing API key | Card Alert with clear message + Retry; search soft-falls to popular cities |
| City not found (search) | “No cities found.” |
| Network / timeout | Friendly network message from `fetch-json` |
| Quota paused | Emergency SQLite stale if available; else rate-limit message |
| City detail failure | Alert + Retry (not an empty hero) |

`ApiError` codes/status now flow through `apiErrorFromCaught` (404 stays 404).

## Loading & data

- Hydration → skeletons for uncached cards; refresh keeps data + spinner
- Cities: `meridian:saved-cities` via `useSyncExternalStore`
- Quota defaults: soft **950** / hard **1000** / **60**/min
- Server `current` TTL ~1h fresh / 2h stale; client dashboard max-age current **1h** (`DASHBOARD_CURRENT_MAX_AGE_MS`)
- Warning threshold **800** (admin-configurable via `platform_settings` with soft/hard/per-minute limits)
- L0 localStorage writes require functional consent; in-memory session L0 still works without it
- Non-`en` weather L2 keys append `,{lang}`

## Stretch backends (optional study)

- Cron: `Authorization: Bearer CRON_SECRET` (`weather-alerts`, `weekly-digests`); fail-closed in production when unset
- Admin: HttpOnly cookie `meridian_admin_session`; multi-ESP email (Resend / SendGrid / SES / SMTP)
- Analytics: `POST /api/analytics/collect` when analytics consent; optional GA4
- Popular searches: `GET /api/recent-checks` from `location_weather_checks` (not `seed:checks` snapshots)

## Heroes & ads (portable deploys)

- Unsplash when `UNSPLASH_ACCESS_KEY` is set; else Wikimedia / Pexels / committed `public/hero/*` SVGs
- AdSense when configured + advertising consent; else branded `public/ads/*` PNG placeholders (sr-only overlay)
- Home ads / journal teaser are on by default; set `NEXT_PUBLIC_SHOW_HOME_STRETCH=0` to hide

## Top files to open

1. `src/app/api/weather/route.js`
2. `src/lib/weather/fetch-scope.js`
3. `src/lib/weather/cache-policy.js`
4. `src/lib/api-client.js`
5. `src/lib/api-usage-tracker.js`
6. `src/lib/validators.js`
7. `src/lib/server/api-response.js`
8. `src/features/cities/hooks/useSavedCities.js`
9. `src/features/weather/hooks/useWeatherData.js`
10. `src/lib/db/index.js` (skim schema)

## React talking points

- Feature folders + hooks (`useSavedCities`, `useWeatherData`)
- `useSyncExternalStore` for localStorage without hydration mismatch
- Cache-first then network; batch isolates per-city errors
- City search combobox supports Arrow/Enter keyboard navigation

## Testing honesty

- `npm run test` — validators, cache policy, ApiError mapper, geocode ranking, repos, icons, `/api/weather` + `/api/geocode` route tests
- Manual: search → pin → reload → remove → break key → mobile width

## Demo checklist

1. `OPENWEATHER_API_KEY` only → `npm run dev`
2. Search London → pin → card on dashboard
3. Reload → cities persist
4. Remove → empty state with search open
5. Optional stretch: `/admin` API usage panel (not a Settings → weather toggle — refresh mode lives in code/provider defaults)
6. Optional: `/admin` for usage (not Ctrl+Shift+L — that shortcut is not wired)
