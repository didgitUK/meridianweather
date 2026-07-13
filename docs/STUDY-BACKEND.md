# meridian — Backend study sheet (interview)

Rehearse this before the interview demo. Binding scope: [`SCOPE.md`](../SCOPE.md). Architecture detail: [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Elevator pitch (30 seconds)

Next.js API routes proxy OpenWeather so the key never hits the browser. The user’s city list lives in **localStorage** (brief requirement). Shared weather cache uses **SQLite** plus in-memory cache so we respect the **1000 calls/day** free tier. Default refresh mode is **manual** so reloads don’t burn quota.

## Core vs stretch

| Keep for demo | Freeze (don’t expand; optional env) |
| --- | --- |
| Search, pin/unpin, cards, localStorage | Admin, email/cron, AdSense live, CMS |
| `/api/weather`, `/batch`, `/api/geocode` | 7-locale product work, PWA polish |
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
- Server `current` TTL ~1h fresh / 2h stale; client dashboard max-age current **10m**

## Heroes & ads (portable deploys)

- Unsplash when `UNSPLASH_ACCESS_KEY` is set; else committed `public/hero/*` SVGs
- AdSense when configured + consent; else labeled `public/ads/*` demo placeholders

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

## Testing honesty

- `npm run test` — validators, cache policy, ApiError mapper, geocode ranking, repos, icons
- Manual: search → pin → reload → remove → break key → mobile width
- “With more time”: more route integration tests, combobox keyboard nav, trim stretch surface

## Demo checklist

1. `OPENWEATHER_API_KEY` only → `npm run dev`
2. Search London → pin → card on dashboard
3. Reload → cities persist
4. Remove → empty state with search open
5. Settings → weather refresh mode Manual
6. Optional: `/admin` for usage (not Ctrl+Shift+L — that shortcut is not wired)
