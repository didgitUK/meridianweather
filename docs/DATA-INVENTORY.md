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
| Journal comments | `meridian:journal-comments:{slug}` | Device-only demo comments | Legitimate interest | Until cleared |
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
| First-party analytics | SQLite `site_analytics_events` | Page path, engagement, scroll, ad-slot views | Consent (`analytics` / `advertising` for ad views) | Admin retention / indefinite in v1 |
| Email templates | SQLite `email_templates` | Editable branded HTML | Legitimate interest | Until updated |
| CMS pages | SQLite `cms_pages` | Editable legal/docs copy | Legitimate interest | Until updated |
| Admin users | SQLite `admin_users`, `admin_invites`, `admin_password_resets` | Staff accounts and auth flows | Legitimate interest | Until deleted |
| Admin audit | SQLite `admin_audit_log` | Admin action trail | Legitimate interest | Indefinite in v1 |

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

- Weather: `{lat.toFixed(4)},{lon.toFixed(4)},{scope}` plus `,{lang}` when `lang` is not `en`
- Geocode: `geocode:{normalisedQuery}`

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
| Nominatim / popular-cities | query (client-side merge) | Geocode soft-fallback paths |
| Open-Meteo / NWS | location context | Weather-alert evaluation (cron) |
| Resend / SendGrid / SES / SMTP | email, template content | Subscription emails via active connector |
| Unsplash / Wikimedia / Pexels | location search terms | Hero image resolution |
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
