# Reviewer guide — meridian

**Start here for a demo walkthrough.** Binding interview scope (what must work vs stretch): [`SCOPE.md`](SCOPE.md).

Maps criteria to files and verification steps.

## 5-minute review path

1. Skim [`SCOPE.md`](SCOPE.md) §3 (in-scope demo) and §4 (stretch / freeze).
2. Read this file.
3. Skim [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/DECISIONS.md`](docs/DECISIONS.md) (English-first UI; stretch ADRs are optional extras).
4. `src/app/[locale]/page.js` → `DashboardPage` — search, city grid, loading/empty states (core brief).
5. `src/lib/weather-fetch-orchestrator.js` (facade) → `src/lib/weather/*` — cache policy, upstream strategies, persist (rate-limit mindfulness).
6. `npm run test` (or `npm run verify` before submission).

## Criterion mapping

| Criterion | Where to look | Verify |
| --- | --- | --- |
| Functionality | `src/features/cities/`, `src/features/weather/`, `src/app/api/weather/`, `src/app/api/geocode/` | Search/add/remove cities, cards, localStorage persistence, empty state ([`SCOPE.md`](SCOPE.md) §3) |
| Code quality | `src/lib/weather/`, `src/lib/client/fetch-json.js`, `src/lib/server/api-response.js` | Domain packages, shared client fetch, `{ error, message }` envelope, `npm run test` |
| React patterns | hooks, providers | `useSavedCities`, `useWeatherData` / `weather-batch-client` |
| Problem solving | `lib/weather/*`, api-usage-tracker | Cache layers, strategy fallbacks, batch throttle (1000 calls/day) |
| UX | DashboardPage, WeatherCard, empty/loading/error states | Skeletons, empty instructions, Meteocons icons, responsive layout |
| Readability | Feature modules + weather package seams | Clear core path; stretch (admin/email/ads) is optional — see [`SCOPE.md`](SCOPE.md) §4 |

## Demo script

1. `npm install && cp .env.example .env.local` — set `OPENWEATHER_API_KEY`.
2. `npm run dev` → localhost:3000
3. Search **London**, add city, open card → city detail.
4. `npm run seed:checks` — refresh home → recent checks strip populates.
5. Footer → **Privacy preferences** → enable Advertising (if testing AdSense env).
6. **`/admin`** — usage, refresh interval, platform settings (optional stretch).
7. `/docs` — documentation via `src/app/[locale]/docs/[slug]/page.js` + `src/content/docs/`.
8. Optional: newsletter subscribe; cron with `CRON_SECRET`; React Email templates under `src/emails/`.

## Edge cases

- &lt;2 char search — validation error.
- Duplicate city — deduped by `buildCityId`.
- Remove city with subscriptions — `RemoveCityDialog` unsubscribe prompt.
- Quota exceeded — emergency stale cache; admin status `soft_block` / `hard_block`.
- City detail URL for unsaved city — “not on this device”.
- Premium tier (admin toggle) — minutely strip unlocks, ads hidden.

## Key files

| Area | Path |
| --- | --- |
| Dashboard | `src/features/weather/components/DashboardPage.jsx` |
| City detail | `src/features/weather/components/CityDetailPage.jsx` |
| Weather orchestration | `src/lib/weather/` (`fetch-scope`, `cache-policy`, `upstream-strategies`, `persist`) |
| Client weather batch | `src/features/weather/utils/weather-batch-client.js` |
| API errors | `src/lib/server/api-response.js` |
| Recent checks | `src/lib/weather/recent-checks.js`, `src/app/api/recent-checks/route.js` |
| Icons | `src/features/weather/utils/weather-icon.js`, `public/weather-icons/` |
| AdSense | `src/providers/AdSenseProvider.jsx`, `src/lib/server/adsense.js` |
| Seed | `scripts/seed-recent-checks.mjs` |
| Subscriptions | `src/app/api/subscriptions/route.js`, `src/emails/` |
| Docs | `src/content/docs/*.js`, `src/app/[locale]/docs/[slug]/page.js` |

## Tests

```bash
npm run test
```

Covers validators, usage tracker, formatters, weather-icon mapping, cache policy, upstream strategy runner, contracts, subscription state.

## Deployment notes

- Persistent `DATABASE_PATH` for SQLite.
- `NEXT_PUBLIC_APP_URL` for email unsubscribe links.
- `GOOGLE_ADSENSE_*` in host secrets; `/ads.txt` auto-served.
- Schedule cron routes externally (not in-repo); require `CRON_SECRET` in production.
- `docs.localhost` rewrite via `src/middleware.js`.
