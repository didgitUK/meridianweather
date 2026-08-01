# Operator runbook — meridian (production)

Checklist for [meridianweather.co.uk](https://meridianweather.co.uk) on Gandi Simple Hosting.

## Required env

| Variable | Purpose |
|----------|---------|
| `OPENWEATHER_API_KEY` | Weather + geocode |
| `ADMIN_SECRET` | Session HMAC, secret encryption, consent cookie signing |
| `ADMIN_PASSWORD` / `ADMIN_EMAIL` | Root admin bootstrap |
| `CRON_SECRET` | Bearer for `/api/cron/*` |
| `DATABASE_PATH` | Persistent SQLite (e.g. `/srv/data/home/meridian.db`) |
| `NEXT_PUBLIC_APP_URL` | `https://meridianweather.co.uk` |

## Strongly recommended

| Variable | Purpose |
|----------|---------|
| Email connector (`SMTP_*` / Resend / SendGrid / SES) | Digests, alerts, billing restore |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Web Push + PWA daily refresh |
| `GOOGLE_ADSENSE_CLIENT_ID` | Advertising (script loads only after advertising consent) |
| `NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0` | Honest popular-searches strip |
| Stripe + `ADFEEE_LICENSE_SECRET` | Ad-free checkout (or leave unset — UI shows unavailable) |
| `PLACE_CONTENT_LLM_MODE` + `GEMINI_API_KEY` / OpenAI | Place guide drafts only (`stub` fails publish validation; admin must publish) |

## Cron (external scheduler)

All require `Authorization: Bearer $CRON_SECRET`.

| Route | Suggested cadence |
|-------|-------------------|
| `/api/cron/weather-alerts` | Every 15–30 min |
| `/api/cron/weekly-digests` | Weekly (e.g. Monday 08:00 UTC) |
| `/api/cron/pwa-daily-refresh` | Daily morning |
| `/api/cron/weather-place-seo` | Nightly |
| `/api/cron/place-content` | Nightly / every few hours |
| `/api/cron/data-retention` | Daily (analytics / log purge) |

See also [`docs/ERASURE-RUNBOOK.md`](ERASURE-RUNBOOK.md).

## Seeds / one-offs

```bash
npm run seed:uk-places
npm run unpublish:stub-guides   # or unpublish:all-guides — remove stub filler from sitemap
npm run reset:cms-public        # after docs/legal file updates — HTML ↔ GEO alignment
# Only after Gemini key + human QA: npm run populate:place-content
# Then publish selected guides from admin → Place guides (never leave stub mode published)
```

Confirm admin → Observability shows cron runs green after first schedule. After place-content populate, spot-check `/weather/manchester` (Things to do) and keep guides **draft** until QA. Do not mass-publish for AdSense review.

## AdSense low-value remediation

Rejection reason was **Low value content** (thin / auto-generated / doorway patterns).

**Already fixed in app code (deploy first):** stub guides fail validation and never auto-publish; POI + cold (tier≥3) places `noindex`; sitemap limited to `en`/`en-GB`; About + FAQ + expanded Journal; keyword SEO-bridge removed; hot-place editorial blurbs.

**On the host after deploy:**

1. `npm run unpublish:all-guides` (or `unpublish:stub-guides`) against production `DATABASE_PATH`
2. Set `PLACE_CONTENT_LLM_MODE=gemini` + `GEMINI_API_KEY` (or leave guides unpublished)
3. Curl checks: stub phrase `rewards a paced visit` must be absent; `/sitemap.xml` guide URL count near 0; `/about` and `/faq` return 200
4. Search Console → URL Inspection on `/about`, 2 journal posts, `/weather/london` → Request indexing
5. Wait for stub guide URLs to drop from the index (days)
6. AdSense → Sites → confirm fixes → **Request review** (do not resubmit while pending)

See also [`docs/ADSENSE-CONTENT-REVIEW.md`](ADSENSE-CONTENT-REVIEW.md).

## Deploy

1. Push to GitHub `origin`
2. Deploy host build
3. Upload env via `scripts/gandi-upload-env.sh` (skips empty values)
4. Verify: home load, `/api/platform/limits`, admin login, one cron dry-run

## DNS — www / Search Console

Apex (`meridianweather.co.uk`) is the canonical host. Search Console should use the **apex** property and sitemap:

`https://meridianweather.co.uk/sitemap.xml`

**LiveDNS (2026-07-30):** parking `www` → `webredir.vip.gandi.net` was removed via API; `www` is set to `CNAME meridianweather.co.uk`. Some Gandi NS anycast nodes can lag.

**Hosting limit:** Simple Hosting **Starter** allows **one** vhost (apex only). Requests that hit the instance as `www` return Varnish `404 Vhost unknown` until the plan allows a second vhost + TLS, or a Gandi web-forward 301 to apex is configured in the UI.

App HSTS remains apex-only (`max-age=63072000`, no `includeSubDomains`) until `www` HTTPS is real.

## Analytics — GA4

- **Property:** MeridianWeather (GA4)
- **Measurement ID:** `G-QWS3EPNZCL` via `NEXT_PUBLIC_GA_MEASUREMENT_ID` (public in page source when analytics consent is on)
- Loader: `AnalyticsProvider` → `@next/third-parties/google` (do not paste a second gtag snippet)
- Gandi: upload env (`npm run deploy:gandi:env`) **before** redeploy so `postinstall` build can read `/srv/data/home/meridian.env`
- “Accept all” does **not** enable analytics — Realtime only after Analytics opt-in in cookie prefs

## Privacy / consent

- AdSense runtime script loads only after advertising consent
- First-party analytics require signed `meridian_consent` cookie (`POST /api/consent`)
- Optional GA4 requires the same analytics consent plus `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- IP region hints require functional consent
