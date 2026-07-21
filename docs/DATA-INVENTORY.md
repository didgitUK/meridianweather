# Data inventory — meridian

| Data | Location | Purpose | Lawful basis | Retention |
| --- | --- | --- | --- | --- |
| Saved cities | `meridian:saved-cities` | Dashboard pins (max 10) | Legitimate interest | Until cleared |
| Checked cities | `meridian:checked-cities` | Recent city-detail lookups | Legitimate interest | Until cleared |
| User location profile | `meridian:user-location` | Home / GPS / IP profile + history | Consent (functional for GPS) | Until cleared |
| Client ID | `meridian:client-id` | Anonymous subscription linking | Legitimate interest | Until cleared |
| Weather cache L0 | `meridian:weather-cache` | Fast loads `{cityId:{scope:{payload,fetchedAt}}}` | Consent (functional) — **localStorage writes gated**; in-memory session L0 may still hold data | Until cleared |
| Refresh mode | `meridian:weather-refresh-mode` | Manual vs reload refresh preference | Legitimate interest | Until cleared |
| Temperature unit | `meridian:temperature-unit` | °C / °F display | Legitimate interest | Until cleared |
| Preferred locale | `meridian:preferred-locale` | Language switcher memory | Legitimate interest | Until cleared |
| Accessibility prefs | `meridian:accessibility` | A11y settings sheet | Legitimate interest | Until cleared |
| City detail accordion | `meridian:city-detail-accordion` | Accordion open state | Legitimate interest | Until cleared |
| Subscriptions registry | `meridian:subscriptions` | UI mirror of email prefs | Consent | Until cleared |
| Consent JSON | `meridian:consent` | essential, functional, marketing, analytics, advertising | Consent | Until cleared |
| Tier | `meridian:tier` | Reserved / unused (runtime always free) | — | Until cleared |
| Cookie legacy | `meridian:cookie-consent` | Banner accept flag | Consent | Until cleared |
| Theme | `meridian:theme` | light / dark / system | Legitimate interest | Until cleared |
| Analytics session | `sessionStorage` `meridian_analytics_sid` | First-party analytics session id | Consent (`analytics`) | Session |
| Journal comments | — | Removed; journal posts are read-only | — | — |
| Consent cookie | HttpOnly `meridian_consent` | Analytics ingest binding | Consent | 1 year |
| Admin session | HttpOnly cookie `meridian_admin_session` | Staff admin console | Legitimate interest | Session / expiry |
| Email + subscription rows | SQLite `subscriptions` | Digests/alerts/newsletter | Consent | Until unsubscribe / admin delete |
| Alert dedup | SQLite `subscription_send_log` | Prevent duplicate alert emails (`condition` stores dedup keys) | Legitimate interest | Indefinite in v1 |
| Weather snapshots | SQLite `weather_snapshots` | Shared L2 API cache (not the popular-searches strip) | Legitimate interest | TTL per scope |
| API call log | SQLite `api_call_log` | Quota diagnostics (L1 memory hits are **not** logged) | Legitimate interest | No purge in v1 |
| Platform settings | SQLite `platform_settings` | Refresh interval, limits (`daily_limit`, `warning_threshold`, `soft_block_threshold`, `per_minute_limit`), email connectors, AdSense OAuth, digest defaults, OpenWeather key override, etc. | Legitimate interest | Until updated |
| Locations / checks | SQLite `locations`, `location_weather_checks` | Location catalog + check audit / popular searches | Legitimate interest | Indefinite in v1 |
| Observations / archive | SQLite `weather_observations`, `weather_forecast_archive` | Upstream observation / forecast archives | Legitimate interest | Indefinite in v1 |
| Hero cache | SQLite `hero_image_cache` | Dual-orientation hero URLs | Legitimate interest | Until refreshed |
| AdSense reports | SQLite `adsense_report_snapshots` | Cached Management API rows | Legitimate interest | Until re-synced |
| First-party analytics | SQLite `site_analytics_events` | Page path, engagement, scroll, ad-slot views | Consent (`analytics` / `advertising` for ad views) | 90 days default (`/api/cron/data-retention`) |
| Email templates | SQLite `email_templates` | Editable branded HTML | Legitimate interest | Until updated |
| CMS pages | SQLite `cms_pages` | Editable legal/docs copy | Legitimate interest | Until updated |
| Admin users | SQLite `admin_users`, `admin_invites`, `admin_password_resets` | Staff accounts and auth flows | Legitimate interest | Until deleted |
| Admin audit | SQLite `admin_audit_log` | Admin action trail (auth, config, CMS, blog, templates, secrets) | Legitimate interest | Indefinite in v1 |
| Error events | SQLite `error_events` | Durable API/cron/client errors | Legitimate interest | Indefinite in v1 |
| Process runs | SQLite `process_runs` | Cron job start/finish + counts | Legitimate interest | Indefinite in v1 |
| Email send log | SQLite `email_send_log` | Transactional send attempts (recipient redacted) | Legitimate interest | Indefinite in v1 |
| App / error JSONL | `data/logs/*.jsonl` | Filesystem mirror of structured logger | Legitimate interest | Local disk until rotated/deleted |
| Blog posts | SQLite `blog_posts` | Journal CMS (EN) | Legitimate interest | Until updated |
| Place POIs | SQLite `place_pois` | OSM “Things to do” per weather place | Legitimate interest | Until refreshed / place deleted |
| Place articles | SQLite `place_articles` | Generated local guides (stub/LLM) | Legitimate interest | Until unpublished / deleted |
| Place local links | SQLite `place_local_links` | Outbound local-coverage URLs | Legitimate interest | Until refreshed |
| Place content runs | SQLite `place_content_runs` | Pipeline job audit | Legitimate interest | Indefinite in v1 |
| Place content budget | SQLite `place_content_budget` | Daily LLM/generation caps | Legitimate interest | Rolling day |
| Push subscriptions | SQLite `push_subscriptions` | PWA Web Push endpoints + priority cities | Consent | Until unsubscribe / erase |

## Consent JSON shape (`meridian:consent`)

```json
{
  "essential": true,
  "functional": true,
  "marketing": false,
  "analytics": false,
  "advertising": false
}
```

Functional consent gates **localStorage** L0 weather-cache writes. Analytics consent gates the first-party beacon and GA4. Advertising gates AdSense and ad-slot view events.

## Cache keys (L2)

- Weather: `{lat.toFixed(4)},{lon.toFixed(4)},{scope}[@{ttlClass}]` plus `,{lang}` when `lang` is not `en`
  - Product/dashboard fetches use the default TTL class
  - SEO place warmers use `ttlClass=seo` (key suffix `@seo`) so 24h SEO snapshots cannot poison fresher city/dashboard reads
- Geocode: `geocode:{normalisedQuery}`

## Consent cookie (server)

| Data | Location | Purpose |
| --- | --- | --- |
| Signed consent | HttpOnly cookie `meridian_consent` | Analytics/ad-view ingest binding (HMAC via `ADMIN_SECRET`) | Consent | 1 year |

First-party analytics events are accepted only when this cookie matches; client body `consent` flags are ignored.

## Forecast payload fields

**current:** temperature, feelsLike, description, condition, icon (OWM code), humidity, pressure, dewPoint, uvi, clouds, visibility, windSpeedKmh, windGustKmh, windDeg, sunrise, sunset, alertIds, city, country, timezone, updatedAt, source

**hourly / daily points:** dt, temp, feelsLike, pop, humidity, windSpeedKmh, icon, description, precipitation; daily adds tempMin, tempMax

**minutely points:** dt, precipitation (API scope exists; city-detail UI does not fetch minutely today)

## Subscription row fields (SQLite)

`client_id`, `email`, `type` (`newsletter` / `city_weekly` / `city_alerts`), `city_id` / location fields, `frequency`, `alert_prefs_json`, legacy `alert_on_rain` / `alert_on_storm`, `unsubscribe_token`, active flags, timestamps. Local registry mirrors nested objects (`active`, `subscriptionId`, `unsubscribeToken`, `alertPrefs`, …) via `GET /api/subscriptions?clientId=`.

## Third parties when configured

| Service | Data sent | When |
| --- | --- | --- |
| OpenWeather | lat, lon, geocode query | Weather/geocode requests |
| Nominatim / popular-cities | query (server-side merge in `GET /api/geocode` / `fetchGeocode`) | Geocode soft-fallback paths |
| Open-Meteo / NWS | location context | Weather-alert evaluation (cron) |
| Resend / SendGrid / SES / SMTP | email, template content | Subscription emails via active connector |
| Unsplash / Wikimedia / Pexels | location search terms | Journal / photo-mode imagery (map heroes use Esri tiles) |
| Google AdSense | page context, ad cookies | Advertising consent + env configured |
| Google Analytics (GA4) | page context, GA cookies | `analytics` consent + measurement ID configured |

## First-party analytics (consent-gated)

- `SiteAnalyticsBeacon` records pageviews / engagement / scroll only when `consent.analytics` is true.
- Ad-slot view events require `consent.advertising`.
- Collect endpoint ignores events without a matching consent flag in the request body.

## Not collected in v1

- Cross-site tracking owned by meridian beyond the gated first-party beacon + optional GA4
- Sale of location or email data
- Public end-user accounts (admin staff accounts only)

## Local subscription registry shape (`meridian:subscriptions`)

Mirrors server as nested objects under `cities.{cityId}.{weekly|alerts}` (not bare booleans): `active`, `subscriptionId`, `unsubscribeToken`, `alertPrefs`, etc., synced from `GET /api/subscriptions?clientId=`.
