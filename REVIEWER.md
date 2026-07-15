# Reviewer guide — meridian

**Start here for a demo walkthrough.** Binding interview scope: [`SCOPE.md`](SCOPE.md).

**Demo only needs `OPENWEATHER_API_KEY`.** Everything else (admin, AdSense, email, cron) is **stretch** and optional.

Candidate cue sheet: [`docs/STUDY-BACKEND.md`](docs/STUDY-BACKEND.md) → *Interview cue card*.

## 5-minute review path

1. Skim [`SCOPE.md`](SCOPE.md) §3 (in-scope demo) and §4 (stretch / freeze).
2. Read this file (core demo script below — stop after step 4 unless reviewing stretch).
3. Skim [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) if you want cache/quota depth; [`docs/DECISIONS.md`](docs/DECISIONS.md) stretch ADRs are optional.
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

## Demo script (core)

1. `npm install && cp .env.example .env.local` — set **`OPENWEATHER_API_KEY` only**. (`better-sqlite3` needs a normal Node native-build toolchain — see [README Troubleshooting](README.md#troubleshooting-install).)
2. `npm run dev` → localhost:3000
3. Search **London** → open city detail → **pin** → back to home (card shows data).
4. Reload → city still pinned (localStorage). Unpin → empty state instructions visible.

That is the interview brief. Stop here unless exploring stretch.

## Stretch demos (optional)

5. `npm run seed:checks` — populates L2 `weather_snapshots` for cache demos (does **not** fill the popular-searches strip; that needs real search-triggered checks).
6. AdSense placeholders / live units: Settings FAB → Cookies → Advertising (needs env + consent). Home ads + journal teaser are on by default (`NEXT_PUBLIC_SHOW_HOME_STRETCH=0` hides them).
7. Admin: `/login` then `/admin` (`ADMIN_PASSWORD` / `ADMIN_SECRET`; or local bypass with `ALLOW_DEV_ADMIN_BYPASS=1` when `NODE_ENV=development` and `ADMIN_SECRET` is unset).
8. `/docs` — documentation via `src/app/[locale]/docs/[slug]/page.js` + `src/content/docs/`.
9. Newsletter subscribe; cron with `CRON_SECRET`; React Email templates under `src/emails/`.

## Edge cases

- &lt;2 char search — client does not query (no error UI); server rejects if hit with &lt;2 chars.
- Duplicate city — deduped by `buildCityId`.
- Remove city with subscriptions — `RemoveCityDialog` unsubscribe prompt.
- Quota exceeded — emergency stale cache; admin status `soft_block` / `hard_block`.
- City detail URL for unknown id — copy explains checking a city from dashboard search (checked cities via `meridian:checked-cities` still resolve).
- Advertising off — AdSense script and units stay unloaded; enable via Settings → Cookies (tier is always free; Premium/minutely UI is not wired).
- Force error path — blank/invalid `OPENWEATHER_API_KEY` and retry a card, or DevTools → Offline.

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
| AdSense (stretch) | `src/providers/AdSenseProvider.jsx`, `src/lib/server/adsense.js` |
| Seed (stretch/cache demo) | `scripts/seed-recent-checks.mjs` |
| Subscriptions (stretch) | `src/app/api/subscriptions/route.js`, `src/emails/` |
| Docs | `src/content/docs/*.js`, `src/app/[locale]/docs/[slug]/page.js` |

## Tests

```bash
npm run test
```

Covers validators, usage tracker, formatters, weather-icon mapping, cache policy, upstream strategy runner, contracts, subscription state, and route tests for `/api/weather` + `/api/geocode`.

## Deployment notes

- See [README Deploy](README.md#deploy) for the Vercel / env checklist.
- Persistent `DATABASE_PATH` for SQLite when possible.
- `NEXT_PUBLIC_APP_URL` for production canonicals, email unsubscribe, invites.
- Stretch: `GOOGLE_ADSENSE_*`, `CRON_SECRET`, `ADMIN_*` only if exploring those surfaces.
