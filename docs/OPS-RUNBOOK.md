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
| `PLACE_CONTENT_LLM_MODE` + `GEMINI_API_KEY` / OpenAI | Real place guides (`stub` until keys set) |

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
npm run populate:place-content   # stub OK; set PLACE_CONTENT_LLM_MODE=gemini when GEMINI_API_KEY is live
```

Confirm admin → Observability shows cron runs green after first schedule. After place-content populate, spot-check `/weather/manchester` (Things to do + guides) and admin Place guides.

## Deploy

1. Push to GitHub `origin`
2. Deploy host build
3. Upload env via `scripts/gandi-upload-env.sh` (skips empty values)
4. Verify: home load, `/api/platform/limits`, admin login, one cron dry-run

## DNS — www must not stay on Gandi parking

Google “connection blocked” is **not** caused by `/robots.txt` or the sitemap. Apex (`meridianweather.co.uk`) is crawlable (`Allow: /`, meta `index,follow`).

`www.meridianweather.co.uk` currently CNAMEs to `webredir.vip.gandi.net` (parking). HTTP shows a Gandi parking page; **HTTPS on :443 is connection refused**. Apex also used to send `Strict-Transport-Security: …; includeSubDomains`, which forces HTTPS on `www` and surfaces that refusal to Google.

**Fix in Gandi (LiveDNS + Web Hosting):**

1. Remove the `www` CNAME to `webredir.vip.gandi.net`.
2. Point `www` at the same A/AAAA as apex (`155.133.138.14` / `2001:4b98:dc5:253::14`), or attach `www` as a host alias on the Simple Hosting instance.
3. Ensure the hosting SSL covers `www` (or HTTP→HTTPS redirect to apex).
4. Prefer a 301 from `https://www…` → `https://meridianweather.co.uk`.

App HSTS is apex-only (`max-age=63072000`, no `includeSubDomains`) until `www` HTTPS works; re-enable `includeSubDomains` after that.

## Privacy / consent

- AdSense runtime script loads only after advertising consent
- First-party analytics require signed `meridian_consent` cookie (`POST /api/consent`)
- IP region hints require functional consent
