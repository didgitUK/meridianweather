# Places SEO budget (OWM 1000/day)

URL inventory is not the same as live OpenWeather spend. Seeded `/weather/{slug}` pages exist for SEO; weather scopes are filled on demand and refreshed by tier.

## Daily model

| Bucket | Target | Notes |
|--------|--------|-------|
| Product / dashboard / alerts | ~400 calls | Soft-block still applies globally |
| SEO place pages | ≤ **600** calls (`PLACE_SEO_DAILY_CALL_BUDGET`) | ~200 places × 3 scopes |
| Cache hits | 0 | L1/L2 do not count |

Cold miss ≈ **3** upstream calls (current + daily + hourly).

## Tiers

| Tier | Who | Refresh |
|------|-----|---------|
| Hot | `tier = 1`, pop ≥ 100k, or high `view_count` | Prefer ≤24h age; nightly cron `/api/cron/weather-place-seo` |
| Warm | Recent views (7d) or `tier = 2` | Refresh on hit if age ≥ 24h |
| Cold | Rest of inventory | On hit only; accept soft-stale up to 48h when quota is tight |

## Operator notes

- Seed: `npm run seed:uk-places` (Phase A + B)
- Cron: `GET /api/cron/weather-place-seo` with `Authorization: Bearer $CRON_SECRET`
- Snapshot keys isolate SEO TTL (`@seo`) so 24h SEO rows cannot poison dashboard freshness
- Public `/api/weather` cannot pass `trigger=weather_place_seo`

## Do not

- Weekly-refresh thousands of places (forecast horizon goes stale mid-week and burns quota)
- Raise SSG beyond ~100 places on Gandi
