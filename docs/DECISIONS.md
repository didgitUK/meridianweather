# Architecture decisions

> **Scope note:** Stretch ADRs below (admin, email, ads, etc.) are historical product exploration. Interview delivery authority is [`SCOPE.md`](../SCOPE.md) — core weather dashboard first; do not expand frozen areas without an explicit request.

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

## ADR-005: Resend + React Email for subscriptions

**Context:** Email automation without building a mail stack.

**Decision:** Templates in `src/emails/`; crons send when an email connector API key is present, no-op otherwise. Admin **Email connectors** stores Resend/SendGrid credentials in `platform_settings` (env fallback), selects the active provider, and can sync newsletter contacts to a Resend Audience or SendGrid Marketing list.

**Trade-off:** Production needs verified domains, `NEXT_PUBLIC_APP_URL`, and bounce handling. Sync is push-on-demand, not continuous bi-directional.

## ADR-006: Admin diagnostics via keyboard shortcut

**Context:** Operators need quota visibility without a full admin app.

**Decision:** `Ctrl+Shift+L` opens `ApiUsageModal`; `/api/admin/usage` returns tracker snapshot.

**Trade-off:** Dev bypass when `ADMIN_SECRET` unset — local/review only.

## ADR-007: Legal and docs in-app

**Context:** Footer compliance and self-serve documentation.

**Decision:** Shared sidebar templates for `/legal/*` and `/docs/*`; `docs.localhost` rewrite; twelve user doc pages in `src/content/docs/`.

**Trade-off:** Product copy, not legal counsel.

## ADR-008: Freemium with live AdSense and stub Premium billing

**Context:** Monetization without Stripe in v1.

**Decision:** Tier and consent in localStorage. Google AdSense loads when env configured and `consent.advertising` on free tier (`AdSenseProvider`, `AdSlot`, `/api/ads`, `/ads.txt`). Premium removes ads and gates minutely forecast only. Stripe checkout stubbed; dev tier toggle in admin modal.

**Trade-off:** Tier is client-trusted until billing ships; marketing copy mentions extended daily but code does not gate it.

## ADR-009: No data sale in v1

Data licensing and anonymised analytics are documented as roadmap only. No collection pipeline ships in v1.

## ADR-010: Meteocons local weather icons

**Context:** OpenWeather CDN PNGs are low-resolution and external dependency.

**Decision:** MIT Meteocons fill SVGs copied to `public/weather-icons/` via `postinstall`; OpenWeather icon codes mapped in `weather-icon.js`.

**Trade-off:** Manual mapping maintenance when adding conditions; attribution required.

## ADR-011: Platform recent checks from SQLite

**Context:** Dashboard should show platform activity without per-user tracking.

**Decision:** `GET /api/recent-checks` reads deduped `weather_snapshots`; showcase fallback; optional `seed:checks` script for demos.

**Trade-off:** Not a personal history; coordinate-level aggregation only.

## ADR-012: Consent model without strict functional enforcement

**Context:** GDPR-style categories before full analytics stack.

**Decision:** `meridian:consent` JSON with advertising gating AdSense only; functional flag stored but L0 cache not blocked when false in v1.

**Trade-off:** Document honestly; tighten enforcement if required later.

## ADR-013: Dual-orientation Unsplash hero backgrounds

**Context:** Location-based dashboard heroes were a single Unsplash landscape URL cropped for every viewport, with weak geometry gates (`width >= height` plus `results[0]` fallback). Random photos often looked poorly framed.

**Decision:** Resolve and cache **landscape** (~16:9 aspect band, min width 1600) and **portrait** (~9:16 aspect band, min height 1600) variants per region. Search queries prefer landmark → monument → skyline → cityscape → country landscape. Reject candidates outside aspect/size gates (no weak fallback). Deliver via Unsplash `urls.raw` with `fit=crop&crop=entropy` Imgix params. UI serves portrait below `sm`, landscape from `sm` up. Cache rows require `dual_resolved` so legacy single-URL entries re-fetch.

**Trade-off:** Up to two Unsplash searches per cache miss (parallel); either orientation may be null and the hero falls back to the gradient for that slot.

## ADR-013: English-first product UI with locale routing for SEO

**Context:** `next-intl` scaffolds seven locales for metadata, hreflang, and error strings. Full product-copy translation is not shipped in v1.

**Decision:** Interactive UI (dashboard, city detail, settings, admin) remains English-first. `messages/*.json` cover `Seo` and `Errors` only. Locale prefixes and sitemap hreflang stay for SEO readiness.

**Trade-off:** Avoids “i18n theater” until copy is translated; reviewers should not expect `useTranslations` in feature components yet.

## ADR-014: AdSense Management API for admin earnings

**Context:** Meridian’s primary free-tier revenue is AdSense. Admins should see earnings without logging into Google.

**Decision:** OAuth 2.0 (`adsense.readonly`) stores an encrypted refresh token on `platform_settings`. Server syncs report snapshots into `adsense_report_snapshots` (DATE, PAGE_URL, PLATFORM_TYPE_NAME, COUNTRY_NAME). Admin AdSense section shows earnings hero, KPIs, and Recharts trends. Display-unit config (`ca-pub-…`, slots) remains separate from reporting OAuth.

**Trade-off:** Requires Google Cloud OAuth client + AdSense API enabled; earnings lag through yesterday per Google’s reporting.

## ADR-015: Checks Log with trigger attribution (no once-per-day fetch cap)

**Context:** The same location can appear many times per day in archived observations / API checks. Operators need to know *why* (dashboard load, city detail, search, cron) and whether a lookup spent an OpenWeather token — without confusing the climate observation archive with every page view.

**Decision:**
- Extend `location_weather_checks` with `trigger`, `cache_outcome`, and `tokens_used`.
- Propagate a whitelisted `trigger` from clients/crons through `/api/weather` and `/api/weather/batch` into fetch orchestration.
- Log **cache serves** as checks (`tokens_used = 0`) and keep `weather_observations` **upstream-only**.
- Admin **Checks log** (formerly Location history) provides Overview charts, a global checks table, and per-location detail with Provider vs Trigger columns.
- Do **not** enforce a once-per-day upstream cap; freshness remains TTL-based (default ~1h for `current`). Use Checks Log evidence to tune TTL later if needed.

**Trade-off:** Cache-hit logging increases check-row volume. Concurrent in-flight dedupe still records a single upstream check for coalesced waiters.

