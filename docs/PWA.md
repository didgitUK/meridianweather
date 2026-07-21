# Progressive Web App (PWA)

meridian is an installable Progressive Web App. Native App Store / Play Store packaging is out of scope.

## Install

| Platform | How |
| --- | --- |
| Android Chrome | Settings → App → **Install app**, browser install prompt, or the one-time home-screen nudge |
| iPhone / iPad Safari | Share → **Add to Home Screen** (nudge explains this) |
| Desktop Chromium | Browser menu → Install meridian |

Requires HTTPS in production.

## Offline backup

With **Functional** consent on:

1. Pinned cities + top recent checks (capped) are written to a SW-readable Cache API list.
2. `current` + `daily` weather is prefetched into L0 (`meridian:weather-cache`) on open / reconnect.
3. The service worker caches the app shell, icons, and weather API GETs (network-first).
4. If the network fails, hooks keep serving last-good data up to **48 hours**, with **Updated / Cached / Offline** labels on cards.

Prefer connection; offline never invents weather.

## Quota guards

| Cap | Value |
| --- | --- |
| Recent (non-pinned) in priority list | 3 |
| Max priority cities per device | 12 |
| Unique cities warmed per push cron | 40 (`PWA_CRON_WARM_CITY_CAP`) |

## Daily closed-app refresh

| Platform | Mechanism |
| --- | --- |
| Android Chrome (installed) | Periodic Background Sync tag `meridian-daily-weather` (~24h) |
| iPhone / browsers without periodic sync | Web Push via `/api/cron/pwa-daily-refresh` |
| All | Prefetch on open + `online` event as safety net |

### Notification preferences (Settings → App)

- **Daily refresh** — about once a day when places update
- **Severe weather only** — push only when OpenWeather-derived severe conditions match a priority place
- **Daily + severe** — both

## Server setup (Web Push)

1. Generate keys: `npm run generate:vapid`
2. Set in `.env.local` / host env (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`)
3. Ensure `CRON_SECRET` is set
4. Schedule cron — see [`scripts/crontab.example`](../scripts/crontab.example):

`GET /api/cron/pwa-daily-refresh` daily (e.g. 06:30)

Upload host env with `npm run deploy:gandi:env` when using Gandi.

## Manual checklist

- [ ] Install on Android → opens standalone
- [ ] Install on iOS via Add to Home Screen → opens standalone
- [ ] Pin 2 cities online → enable airplane mode → cards show offline/cached age
- [ ] Settings → App → enable notifications (daily) → subscription row exists in SQLite
- [ ] `curl -H "Authorization: Bearer $CRON_SECRET" $BASE_URL/api/cron/pwa-daily-refresh` returns `sent` / `skipped`
- [ ] SW update toast appears after deploying a new `sw.js`

## Automated checks

`npx playwright test e2e/pwa.smoke.spec.js`

## Key files

- `public/sw.js`, `public/pwa-constants.js`, `public/manifest.webmanifest`, `public/offline.html`
- `src/components/layout/PwaRegistrar.jsx`, `PwaInstallNudge.jsx`
- `src/features/pwa/*`
- `src/features/weather/components/WeatherFreshnessLabel.jsx`
- `src/app/api/push/*`, `src/app/api/cron/pwa-daily-refresh/route.js`
- `src/lib/db/repositories/push-subscriptions.js`
