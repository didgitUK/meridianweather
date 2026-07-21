# Architecture decisions

> **Note:** ADRs below include optional product surfaces (admin, email, ads, dual-orientation photo heroes). Core dashboard and city heroes default to satellite maps; photo providers remain for journal/photo mode.

## ADR-001: OpenWeather One Call 4.0 with 2.5 fallback

**Context:** Need rich weather data within free-tier limits.

**Decision:** Primary integration targets One Call 4.0; current weather falls back to API 2.5 when One Call is unavailable.

**Trade-off:** Normalisation layer (`src/lib/one-call.js`) adds complexity but keeps UI stable across providers.

## ADR-002: Multi-layer cache before upstream

**Context:** 1,000 calls/day quota; multiple users may request the same cities.

**Decision:** L0 browser cache → L1 in-memory → L2 SQLite snapshots, with TTL per scope and `emergency` stale serve when quota blocked.

**Trade-off:** Stale data possible near TTL boundaries; admin panel exposes refresh interval.

## ADR-003: No authentication

**Context:** Personal dashboard, not multi-tenant SaaS.

**Decision:** `localStorage` for cities/theme; anonymous `clientId` UUID for subscription management.

**Trade-off:** Data is per-browser, not portable across devices.

## ADR-004: SQLite via better-sqlite3

**Context:** Simple deployment, no external DB required.

**Decision:** File-backed SQLite with `DATABASE_PATH` env var.

**Trade-off:** Production needs persistent volume; acceptable for demo/small deploys.

## ADR-005: Multi-ESP email + React Email for subscriptions

**Context:** Email automation without building a mail stack.

**Decision:** Templates in `src/emails/` (plus editable DB `email_templates`); crons/`sendTransactionalEmail` send when an email connector is configured, no-op when connector is `none`. Admin **Email connectors** supports **Resend, SendGrid, Amazon SES, and SMTP** credentials in `platform_settings` (env fallback), selects the active provider, and can sync newsletter contacts to a Resend Audience or SendGrid Marketing list where applicable.

**Trade-off:** Production needs verified domains, `NEXT_PUBLIC_APP_URL`, and bounce handling. Sync is push-on-demand, not continuous bi-directional.

## ADR-006: Admin diagnostics via `/admin`

**Context:** Operators need quota visibility without a keyboard-driven modal.

**Decision:** Admin console at `/admin` (session cookie `meridian_admin_session`) surfaces API usage, connectors, and platform settings. Primary APIs include `GET /api/admin/usage` and `GET|PATCH /api/admin/config`, plus stretch routes for users, invites, password reset, email compose, CMS, AdSense OAuth, analytics, and checks. Multi-user `admin_users` with invite/reset tokens ships alongside root `ADMIN_PASSWORD` login. Signing uses `ADMIN_PASSWORD` / `ADMIN_SECRET`. Dev auth bypass runs when `NODE_ENV=development` and no signing secret is set (see also `ALLOW_DEV_ADMIN_BYPASS`).

**Trade-off:** Production must set a signing secret and use login; there is no `x-admin-secret` header auth path.

## ADR-007: Legal and docs in-app

**Context:** Footer compliance and self-serve documentation.

**Decision:** Shared sidebar templates for `/legal/*` and `/docs/*`; `docs.localhost` rewrite; **eleven** user doc pages in `DOCS_PAGES` (`src/content/docs/defaults.js`).

**Trade-off:** Product copy, not legal counsel. CMS SQLite rows may diverge until reset to file defaults.

## ADR-008: AdSense live; ad-free Stripe; Premium weather tier retired

**Context:** Monetization without a separate weather “Premium” product.

**Decision:** Consent in localStorage (`meridian:consent`) plus signed HttpOnly `meridian_consent` for analytics ingest. Google AdSense **runtime** script loads only when `consent.advertising` and config are on (`AdSenseProvider`). Publisher verification uses meta `google-adsense-account` only (no pre-consent script). `ConsentProvider` hardcodes weather `tier: free`; `meridian:tier` remains reserved/unused. Weather **PremiumGate / minutely UI are removed** — paid product is **ad-free Stripe** (`/api/billing/*`, Settings → Remove ads) when `isBillingConfigured()`. When Stripe env is unset, Settings shows an unavailable state (no “coming soon” checkout buttons).

**Trade-off:** Docs and legal must not claim live Premium weather features; advertising is consent-gated; ad-free requires Stripe + `ADFEEE_LICENSE_SECRET` on the host.

## ADR-009: No data sale; first-party analytics ships (consent-gated)

**Context:** Privacy stance vs operator visibility.

**Decision:** No sale of personal data. A first-party beacon (`SiteAnalyticsBeacon` → `POST /api/analytics/collect` → `site_analytics_events`) ships and records only when a signed HttpOnly `meridian_consent` cookie grants analytics (body consent flags are ignored). Optional GA4 loads only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set **and** `consent.analytics` is on. Ad-slot view events require advertising consent on the same signed cookie. Data-licensing products remain roadmap.

**Trade-off:** “Accept all” on the cookie banner enables functional + advertising, not analytics — GA4 and the first-party beacon stay off until analytics is toggled in preferences.

## ADR-010: Meteocons local weather icons

**Context:** OpenWeather CDN PNGs are low-resolution and external dependency.

**Decision:** MIT Meteocons fill SVGs copied to `public/weather-icons/` via `postinstall`; OpenWeather icon codes mapped in `src/features/weather/utils/weather-icon.js`.

**Trade-off:** Manual mapping maintenance when adding conditions; attribution required.

## ADR-011: Platform popular searches (recent checks)

**Context:** Dashboard should show platform activity without framing a personal search history.

**Decision (current):** Home UI shows “Near you” (nearby places + current weather) and “Popular searches” (5 cards each). Popular searches data: `GET /api/recent-checks` → `getRecentChecksPayload()` → `listPopularSearchChecks` on `location_weather_checks` (`search_select` / `search_preview`), default limit **20**, `source: popular|empty`. The API does not showcase-hydrate. When empty, the UI may demo-fill Popular searches from `PLATFORM_SHOWCASE_CITIES` while `SHOW_DEMO_POPULAR_SEARCHES` is on (default). `npm run seed:checks` seeds `weather_snapshots` only and does **not** feed this API.

**Superseded:** Earlier v1 used deduped `weather_snapshots` + API-level showcase fallback (`listRecentPlatformChecks` removed).

**Trade-off:** Demo popular cities avoid making the strip look broken on fresh installs; operators should disable the flag for production honesty. Seed script must not be sold as populating Popular searches.

## ADR-012: Consent model — functional L0 writes gated; analytics consent-gated

**Context:** GDPR-style categories with mixed first-party and third-party collection.

**Decision:** `meridian:consent` JSON. Advertising gates AdSense. Functional consent gates **localStorage** writes to `meridian:weather-cache` (in-memory session L0 still works). Analytics consent gates the first-party beacon and GA4; advertising consent additionally gates ad-slot view events on the beacon.

**Trade-off:** Banner “Accept all” does not enable analytics — operators must disclose that GA/beacon need an explicit analytics toggle.

## ADR-013: Dual-orientation photo heroes (journal / photo mode)

**Context:** Photo-based location heroes (and journal imagery) previously used a single Unsplash landscape URL cropped for every viewport, with weak geometry gates (`width >= height` plus `results[0]` fallback). Random photos often looked poorly framed. Dashboard and city-detail heroes later moved to Esri satellite maps by default; this ADR still governs the photo cascade when maps are off or photos are requested.

**Decision:** Resolve and cache **landscape** (~16:9 aspect band, min width 1600) and **portrait** (~9:16 aspect band, min height 1600) variants per region. Search queries prefer landmark → monument → skyline → cityscape → country landscape. Reject candidates outside aspect/size gates (no weak fallback). Cascade Unsplash → Wikimedia → Pexels. Deliver via Unsplash `urls.raw` with `fit=crop&crop=entropy` Imgix params when Unsplash wins. UI serves portrait below `sm`, landscape from `sm` up. Cache rows require `dual_resolved` so legacy single-URL entries re-fetch.

**Trade-off:** Up to two Unsplash searches per cache miss (parallel); either orientation may be null and the UI falls back to gradient or static SVGs for that slot.

## ADR-014: AdSense Management API for admin earnings

**Context:** Meridian’s primary free-tier revenue is AdSense. Admins should see earnings without logging into Google.

**Decision:** OAuth 2.0 (`adsense.readonly`) stores an encrypted refresh token on `platform_settings`. Server syncs report snapshots into `adsense_report_snapshots` (DATE, PAGE_URL, PLATFORM_TYPE_NAME, COUNTRY_NAME). Admin AdSense section shows earnings hero, KPIs, and Recharts trends. Display-unit config (`ca-pub-…`, slots) remains separate from reporting OAuth.

**Trade-off:** Requires Google Cloud OAuth client + AdSense API enabled; earnings lag through yesterday per Google’s reporting.

## ADR-015: Public UI localized; auth/admin English-first

**Context:** `next-intl` scaffolds seven locales. Full product-copy translation for admin/auth is out of scope; public surfaces, legal, docs, and journal should follow the selected locale.

**Decision:** Public interactive UI (dashboard, city detail, search, header/footer, cookies/settings chrome, subscriptions dialogs on public pages) reads `messages/{locale}.json`. Legal, docs, and journal long-form content resolve via locale file packs (`src/content/*/i18n`, `src/constants/blog-posts-i18n`); English / en-GB continue to use CMS/English defaults. Live OpenWeather fetches pass `lang` from the UI locale. Auth and admin remain English-first.

**Trade-off:** Non-English legal/docs packs can drift from CMS-edited English; admin CMS editors stay English-only without a locale column.

## ADR-016: Security hardening without new infra

**Context:** Stretch admin/email/cron surfaces shipped with several production-unsafe defaults (open cron when secret unset, `ADMIN_PASSWORD` reuse as HMAC key, no auth rate limits, no security headers). Redis/MFA/RBAC product expansion is out of scope for this app.

**Decision:**
- Split `ADMIN_SECRET` (signing + AES) from `ADMIN_PASSWORD` (root login only); fail-closed cron in production; explicit `ALLOW_DEV_ADMIN_BYPASS=1` for local bypass.
- In-memory per-IP rate limits on abusive public endpoints; validate/cap weather batch and subscriptions.
- Site-wide security headers + baseline CSP; `session_version` for session invalidation; encrypt connector secrets at rest; consent-gate first-party analytics + GA4.

**Trade-off:** Single-process rate limits; CSP kept permissive enough for Next/AdSense/GA; no distributed revocation store.

## ADR-017: Checks Log with trigger attribution (no once-per-day fetch cap)

**Context:** The same location can appear many times per day in archived observations / API checks. Operators need to know *why* (dashboard load, city detail, search, cron) and whether a lookup spent an OpenWeather token — without confusing the climate observation archive with every page view.

**Decision:**
- Extend `location_weather_checks` with `trigger`, `cache_outcome`, and `tokens_used`.
- Propagate a whitelisted `trigger` from clients/crons through `/api/weather` and `/api/weather/batch` into fetch orchestration.
- Record checks for **upstream** outcomes in `location_weather_checks` (cache-only serves are **not** logged today); keep `weather_observations` **upstream-only**.
- Admin **Checks log** provides Overview charts, a global checks table, and per-location detail with Provider vs Trigger columns.
- Do **not** enforce a once-per-day upstream cap; freshness remains TTL-based (default ~1h for `current`).

**Trade-off:** Cache-hit rows are not represented in Checks Log; operators see token-spending traffic only. Concurrent in-flight dedupe still records a single upstream check for coalesced waiters.

## ADR-018: Place content hybrid guides (OSM + generated prose)

**Context:** Weather place pages need location-relevant content beyond forecasts without manually authoring thousands of pages or scraping news bodies.

**Decision:** Phase 1 hybrid pipeline — Overpass/OSM POIs for “Things to do”, original Meridian guides via Gemini/OpenAI (or stub) with validation (≥1500 words, H2s, sources, image credits), plus optional outbound local-coverage links. Persist in `place_*` tables; admin publish/lock; cron + `populate:place-content` for hot UK places first. Weather remains primary above the fold.

**Trade-off:** Stub mode ships readable placeholders until `PLACE_CONTENT_LLM_MODE=gemini|openai` + keys; Overpass is rate-limited and needs a polite User-Agent; Phase 2 global inventory stays deferred.

## ADR-019: Hero weather theater on satellite map

**Context:** Dashboard/city heroes use Esri World Imagery via Leaflet. Operators need a 24h scrub/play control tied to local solar framing without breaking the map mount.

**Decision:** `HeroWeatherTimeline` + `useHeroWeatherTheater` drive continuous hour scrubbing, sunrise/sunset markers, and night wash. Leaflet mounts on a **stable inner DOM node** so React className updates (fade/ready) cannot strip `leaflet-container`. Live hour label tracks under the playhead.

**Trade-off:** Map needs finite lat/lon (location or place coords); empty-location OSM hero can still look black until coords exist.

