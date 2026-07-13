# Data inventory — meridian

| Data | Location | Purpose | Lawful basis | Retention |
| --- | --- | --- | --- | --- |
| Saved cities | `meridian:saved-cities` | Dashboard (max 10) | Legitimate interest | Until cleared |
| Client ID | `meridian:client-id` | Anonymous subscription linking | Legitimate interest | Until cleared |
| Weather cache L0 | `meridian:weather-cache` | Fast loads `{cityId:{scope:{payload,fetchedAt}}}` | Consent (functional) | Until cleared |
| Subscriptions registry | `meridian:subscriptions` | UI mirror of email prefs | Consent | Until cleared |
| Consent JSON | `meridian:consent` | essential, functional, marketing, analytics, advertising | Consent | Until cleared |
| Tier | `meridian:tier` | free / premium | Consent | Until cleared |
| Cookie legacy | `meridian:cookie-consent` | Banner accept flag | Consent | Until cleared |
| Theme | `meridian:theme` | light / dark / system | Legitimate interest | Until cleared |
| Email + subscription rows | SQLite `subscriptions` | Digests/alerts/newsletter | Consent | Until unsubscribe / admin delete |
| Alert dedup | SQLite `subscription_send_log` | Prevent duplicate alert emails | Legitimate interest | Indefinite in v1 |
| Weather snapshots | SQLite `weather_snapshots` | Shared API cache + recent checks | Legitimate interest | TTL per scope |
| API call log | SQLite `api_call_log` | Quota diagnostics | Legitimate interest | No purge in v1 |
| Platform settings | SQLite `platform_settings` | Refresh interval, limits, email connector credentials | Legitimate interest | Until updated |

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

Functional consent is stored but L0 cache writes are not strictly gated in v1.

## Cache keys (L2)

- Weather: `{lat.toFixed(4)},{lon.toFixed(4)},{scope}`
- Geocode: `geocode:{normalisedQuery}`

## Forecast payload fields

**current:** temperature, feelsLike, description, condition, icon (OWM code), humidity, pressure, dewPoint, uvi, clouds, visibility, windSpeedKmh, windGustKmh, windDeg, sunrise, sunset, alertIds, city, country, timezone, updatedAt, source

**hourly / daily points:** dt, temp, feelsLike, pop, humidity, windSpeedKmh, icon, description, precipitation; daily adds tempMin, tempMax

**minutely points:** dt, precipitation

## Third parties when configured

| Service | Data sent | When |
| --- | --- | --- |
| OpenWeather | lat, lon, geocode query | Weather/geocode requests |
| Resend / SendGrid | email, template content | Subscription emails via active connector |
| Google AdSense | page context, ad cookies | Free tier + advertising consent + env configured |

## Not collected in v1

- Cross-site tracking by meridian (first-party)
- Sale of location or email data
- Server-side user accounts
- Analytics pipeline (category reserved)

## Local subscription registry shape (`meridian:subscriptions`)

Mirrors server: email, newsletter boolean, `cities.{cityId}.{weekly|alerts}` flags synced from `GET /api/subscriptions?clientId=`.
