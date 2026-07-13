# meridian — Weather Dashboard

Multi-city weather dashboard built for the interview coding exercise: search/add/remove cities, show current conditions, persist selections in localStorage, and stay mindful of OpenWeather’s free-tier limits.

**Scope:** see **[SCOPE.md](SCOPE.md)** — required demo vs stretch extras.  
**Study sheet:** **[docs/STUDY-BACKEND.md](docs/STUDY-BACKEND.md)** — choices, cache/quota, interview talking points.

## Quick start

```bash
cp .env.example .env.local
# Required: OPENWEATHER_API_KEY
# Recommended for live hero photos: UNSPLASH_ACCESS_KEY
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`better-sqlite3` needs a normal Node native-build toolchain (Python/make on some Linux images). The SQLite file is created automatically under `./data/` (gitignored).

## Approach

1. **Next.js App Router** with **API routes** that proxy OpenWeather (API key stays server-side).
2. **localStorage** for the user’s city list (brief requirement).
3. **Caching** (browser + memory + SQLite) and a daily quota tracker to respect the free tier.
4. **JavaScript** (not TypeScript) for this delivery; English-first UI.
5. Stretch (admin, email, AdSense) is optional and degrades when env vars are unset.

## Assumptions & decisions

- City “add” is **pin from city detail** after search (preview before saving).
- Without `UNSPLASH_ACCESS_KEY`, the hero uses committed static SVGs in `public/hero/`.
- Without AdSense env/consent, slots show labeled demo placeholders in `public/ads/` (not live network ads).
- Deploy hostname does not matter for Unsplash CDN or static assets; set `NEXT_PUBLIC_APP_URL` only for production SEO/email links.

## Environment

| Variable | Purpose |
| --- | --- |
| `OPENWEATHER_API_KEY` | **Required** — weather and geocode |
| `UNSPLASH_ACCESS_KEY` | Optional — live location hero photos (static fallbacks otherwise) |
| `RESEND_API_KEY` | Optional — subscription emails |
| `RESEND_FROM_EMAIL` | Sender for Resend |
| `NEXT_PUBLIC_APP_URL` | Base URL for email unsubscribe links (production) |
| `DATABASE_PATH` | SQLite path (default `./data/meridian.db`) |
| `CRON_SECRET` | Bearer token for `/api/cron/*` |
| `ADMIN_PASSWORD` / `ADMIN_SECRET` | Admin session signing (dev bypass when unset) |
| `GOOGLE_ADSENSE_CLIENT_ID` | AdSense publisher ID (`ca-pub-…`) |
| `GOOGLE_ADSENSE_SLOT_*` | Display unit IDs per placement |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `start` | Production |
| `npm run test` | Vitest unit tests |
| `npm run verify` | Lint + test + build |
| `npm run copy:icons` | Copy Meteocons → `public/weather-icons/` |
| `npm run seed:checks` | Seed North England recent checks demo data |

## Features

### Core (interview brief)

- City search, pin/unpin, localStorage persistence, empty-state guidance
- Weather cards: temperature, description, icons; detail view for extras (humidity/wind, forecasts)
- Loading and error states; API key via env; Next.js API routes proxy OpenWeather
- Caching + quota tracking to respect free-tier rate limits
- Responsive layout (mobile + desktop)

### Stretch (optional — frozen; see SCOPE.md)

- Hero photos, recent checks strip, city detail forecasts/alerts
- Newsletter / email digests (Resend + cron), AdSense (or demo placeholders)
- Admin at `/admin` / `/login`, legal + docs pages

## What we’d improve with more time

- More route-level integration tests around `/api/weather` and `/api/geocode`
- Full keyboard navigation for the city search combobox
- Trim or feature-flag stretch surfaces for a sharper reviewer’s first impression
- Optional production deploy (Vercel) with documented env vars

## Reviewers

1. **[SCOPE.md](SCOPE.md)** — what must work vs stretch  
2. **[REVIEWER.md](REVIEWER.md)** — 5-minute demo path  
3. **[docs/STUDY-BACKEND.md](docs/STUDY-BACKEND.md)** — backend study sheet  
4. `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`

## Stack

Next.js 16 (App Router), **JavaScript**, Tailwind CSS v4, ShadCN UI, Vitest, Meteocons icons. Optional stretch: SQLite (`better-sqlite3`), Resend + React Email, Google AdSense.
