# meridian — Weather Dashboard

Multi-city weather dashboard built for the interview coding exercise: search cities, **pin** them from city detail, show current conditions, persist selections in localStorage, and stay mindful of OpenWeather’s free-tier limits.

**Scope:** see **[SCOPE.md](SCOPE.md)** — required demo vs stretch extras.  
**Study sheet:** **[docs/STUDY-BACKEND.md](docs/STUDY-BACKEND.md)** — choices, cache/quota, interview cue card.  
**Live demo:** _paste production URL here after deploy_ (see [Deploy](#deploy)).

## Quick start

```bash
cp .env.example .env.local
# Required: OPENWEATHER_API_KEY
# Recommended for live hero photos: UNSPLASH_ACCESS_KEY (optional: PEXELS_API_KEY)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo needs only `OPENWEATHER_API_KEY`.** Admin/email/ads are stretch extras.

## Before you submit

- [ ] `.env.local` has a valid `OPENWEATHER_API_KEY`
- [ ] `npm install` succeeds (see [Troubleshooting](#troubleshooting-install) if `better-sqlite3` fails)
- [ ] `npm run test` is green
- [ ] Manual walk: search → city detail → **pin** → reload → **unpin** → empty state
- [ ] You can answer the [interview cue card](docs/STUDY-BACKEND.md#interview-cue-card-1-screen) without notes
- [ ] Optional: deploy and paste the live URL under **Live demo** above

## Troubleshooting install

`better-sqlite3` is a **core** dependency (L2 cache + quota + platform settings). It compiles a native addon.

| | |
| --- | --- |
| **Needs** | Node native-build tools — Python 3 + `make`/`g++` (Linux/macOS), or Visual Studio Build Tools (Windows) |
| **Symptom** | `npm install` fails while building `better-sqlite3` |
| **Fix** | Install the toolchain, then `rm -rf node_modules && npm install` |
| **After install** | SQLite file auto-creates under `./data/` (gitignored). Only `OPENWEATHER_API_KEY` is required to run the core demo. |

`postinstall` also runs `copy:icons` for Meteocons SVGs.

## Approach

1. **Next.js App Router** with **API routes** that proxy OpenWeather (API key stays server-side).
2. **localStorage** for the user’s pinned city list (brief requirement).
3. **Caching** (browser L0 + memory L1 + SQLite L2) and a daily quota tracker (default 1000/day, 60/min; warning 800; soft-block 950).
4. **JavaScript** (not TypeScript) for this delivery. Public UI ships **7 locales** via `next-intl` (`en`, `en-GB`, `de`, `fr`, `es`, `ja`, `ar`); admin/auth stay English-first.
5. Stretch (admin, email, AdSense) is optional for the interview brief. In development, unset admin secrets may grant a local admin bypass; cron is fail-closed in production when `CRON_SECRET` is unset.

## Assumptions & decisions

- City “add” is **pin from city detail** after search (preview before saving). UI copy says pin/unpin.
- Default weather refresh mode is **manual** (`meridian:weather-refresh-mode`) — cards reuse local cache until refresh.
- Functional cookie consent gates **localStorage** writes to `meridian:weather-cache` (in-memory session cache still works).
- Hero photos cascade Unsplash → Wikimedia Commons (keyless) → Pexels; static SVGs in `public/hero/` are last resort.
- Without AdSense env/consent, slots show branded demo placeholders in `public/ads/` (overlay text is sr-only).
- Home ads + journal teaser stay **off** unless `NEXT_PUBLIC_SHOW_HOME_STRETCH=1` (keeps the interview path on search → pin → cards).
- Popular-searches strip seeds showcase cities when empty (disable with `NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0`).
- Set `NEXT_PUBLIC_APP_URL` in production for SEO canonicals, email unsubscribe, admin invite/reset links, and AdSense OAuth callback fallback.

## Environment

| Variable | Purpose |
| --- | --- |
| `OPENWEATHER_API_KEY` | **Required** — weather; primary geocode (also merges Nominatim + popular-cities offline list) |
| `UNSPLASH_ACCESS_KEY` | Optional — primary live location hero photos |
| `PEXELS_API_KEY` | Optional — third hero provider after Unsplash + Wikimedia |
| `DATABASE_PATH` | SQLite path (default `./data/meridian.db`) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Optional — Resend email connector |
| `SENDGRID_API_KEY` / `SENDGRID_FROM_EMAIL` | Optional — SendGrid connector |
| `AWS_*` / `AWS_SES_*` | Optional — Amazon SES connector |
| `SMTP_*` | Optional — SMTP connector |
| `NEXT_PUBLIC_APP_URL` | Production base URL (SEO, email links, invites, OAuth fallback) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional — GA4 (requires analytics consent) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional — Street View hero embed |
| `CRON_SECRET` | Bearer for `/api/cron/*` (**required in production** if cron is used) |
| `ADMIN_SECRET` | Session HMAC + connector encryption (**required** for admin login cookies) |
| `ADMIN_PASSWORD` / `ADMIN_EMAIL` | Root admin login |
| `ALLOW_DEV_ADMIN_BYPASS` | Optional `1` — local admin bypass when `NODE_ENV=development` and no `ADMIN_SECRET` |
| `GOOGLE_ADSENSE_CLIENT_ID` | AdSense publisher ID (`ca-pub-…`) |
| `GOOGLE_ADSENSE_SLOT_DASHBOARD` / `_HERO` / `_RECENT` / `_CITY_DETAIL` / `_DEFAULT` | Display unit IDs |
| `GOOGLE_ADSENSE_OAUTH_*` | Optional — AdSense Management API for admin earnings |

See [`.env.example`](.env.example) for the full list. Security notes: admin session cookie `meridian_admin_session`; first-party analytics beacon + GA4 require analytics consent (see Cookie Policy).

## Deploy

Suggested host: **Vercel** (or any Node host that can build native modules / supply a SQLite-compatible filesystem).

| Env | Core demo | Notes |
| --- | --- | --- |
| `OPENWEATHER_API_KEY` | Required | Without it, weather/geocode fail closed |
| `NEXT_PUBLIC_APP_URL` | Required in prod | Canonical URLs, email/unsubscribe, invites |
| `DATABASE_PATH` | Recommended | Point at persistent storage when the host allows it. Ephemeral disk is acceptable for a short interview demo (cache/quota reset on redeploy). |

**Stretch only** (skip unless showing those surfaces): `ADMIN_SECRET`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`, `CRON_SECRET`, AdSense keys, email provider keys, `NEXT_PUBLIC_SHOW_HOME_STRETCH=1`.

After deploy, paste the live URL under **Live demo** at the top of this README.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` then `npm run start` | Production |
| `npm run test` | Vitest unit tests |
| `npm run lint` | ESLint |
| `npm run verify` | Lint + test + build |
| `npm run copy:icons` | Copy Meteocons → `public/weather-icons/` (also `postinstall`) |
| `npm run seed:checks` | Seed North England **weather_snapshots** (L2 cache demo — not popular-searches strip) |
| `npm run backfill:city-slugs` | Backfill location slugs |
| `npm run audit:deps` | `npm audit --omit=dev` |

## Features

### Core (interview brief)

- City search → city detail → **pin/unpin**, localStorage persistence, empty-state guidance
- Weather cards: temperature, description, humidity, wind, **Meteocons** icons; detail view for fuller metrics and forecasts
- Loading and error states; API key via env; Next.js API routes proxy OpenWeather (`/api/weather`, `/api/weather/batch`, `/api/geocode`, `/api/platform/limits`)
- Caching + quota tracking (1000/day default) to respect free-tier rate limits
- Responsive layout (mobile + desktop); 7 public locales

### Stretch (optional — frozen; see SCOPE.md)

- Hero photos, popular-searches / recent-checks strip, city detail forecasts/alerts, journal
- Newsletter / digests / alerts (multi-ESP: Resend, SendGrid, SES, SMTP + cron), AdSense (or demo placeholders)
- Admin at `/login` → `/admin`, legal + docs pages, first-party analytics + optional GA4

## What we’d improve with more time

- Paste a production deploy URL once hosted
- Live AdSense / email stretch surfaces when demoing monetization (set `NEXT_PUBLIC_SHOW_HOME_STRETCH=1`)

## Reviewers

1. **[SCOPE.md](SCOPE.md)** — what must work vs stretch  
2. **[REVIEWER.md](REVIEWER.md)** — 5-minute demo path  
3. **[docs/STUDY-BACKEND.md](docs/STUDY-BACKEND.md)** — backend study sheet + cue card  
4. `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`

## Stack

Next.js 16 (App Router), React 19, **JavaScript**, Tailwind CSS v4, ShadCN UI, Vitest, Meteocons icons, **SQLite (`better-sqlite3`) for cache/quota**. Stretch: multi-ESP email + React Email, Google AdSense, `next-intl`.
