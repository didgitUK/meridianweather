# Security posture — meridian

Security notes for the weather dashboard and stretch admin surface. Controls below harden what already ships; they do not claim SOC2/ISO certification.

## Threat model (brief)

| Asset | Risk | Mitigation |
| --- | --- | --- |
| OpenWeather API key | Leak / quota burn | Server-only proxy; per-IP rate limits; upstream quota tracker |
| Admin sessions | Takeover / CSRF | HttpOnly cookie, HMAC (`ADMIN_SECRET`), session versioning on password change; null-sub legacy sessions rejected |
| Cron jobs | Unauthenticated email / alert spam | `CRON_SECRET` Bearer required in production (fail closed) |
| Subscriptions / analytics | Abuse, DB growth | Rate limits, validation, signed consent cookie (not body flags), same-origin check |
| Connector secrets in SQLite | DB file theft | AES-256-GCM via `ADMIN_SECRET` (`encryptSecret`; no `plain:` in production) |
| Third-party scripts | XSS / tracking | Consent-gated AdSense/GA loaders + CSP baseline; meta-only AdSense account verification |

## Production env checklist

| Variable | Role |
| --- | --- |
| `ADMIN_SECRET` | **Required** — session HMAC + secret encryption + consent cookie signing (never a login password) |
| `ADMIN_PASSWORD` | Root bootstrap login for `ADMIN_EMAIL` only |
| `CRON_SECRET` | **Required** — Bearer for `/api/cron/*` (denied if unset in production) |
| `OPENWEATHER_API_KEY` | Weather/geocode |
| `ALLOW_DEV_ADMIN_BYPASS` | Dev only (`1` + `NODE_ENV=development` + no `ADMIN_SECRET`) |

Keep real values in `.env.local` only. See `.env.example`.

## Controls in place

- **Auth:** scrypt passwords, timing-safe compares, root env unlock limited to `ADMIN_EMAIL`, invite/reset tokens (32-byte, hashed at rest, TTL, single-use)
- **Sessions:** signed cookie; `session_version` invalidates tokens after password change/reset; legacy `sub: null` sessions rejected
- **Abuse:** in-memory IP rate limits on login, forgot/reset, invite accept, subscriptions, analytics, consent sync, weather batch, geocode, push subscribe/unsubscribe; rate-limit keys prefer CDN/`X-Real-IP` then rightmost `X-Forwarded-For` hop
- **Input:** batch city cap + lat/lon/scope validation; subscription email/type/coords; alert id allowlist; admin compose uses `parseEmail()`
- **Headers:** CSP, HSTS apex-only in production (`max-age` without `includeSubDomains` until `www` HTTPS is live), `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`
- **Privacy:** first-party analytics / ad-view events require a signed `meridian_consent` HttpOnly cookie (body consent flags ignored); AdSense script and GA4 load only after advertising/analytics consent; IP region hint gated on functional consent; SSR consent snapshot is pre-choice (all optional categories off)
- **SQL:** parameterized `better-sqlite3` queries
- **Deploy:** Gandi env upload skips empty values so blanks cannot wipe live secrets
- **Supply chain:** `npm run audit:deps`

## Residual risks (accepted for scope)

- In-memory rate limits are per process (not shared across replicas)
- No MFA / RBAC (flat admin trust)
- SameSite=Lax without CSRF tokens (JSON APIs); OAuth start remains GET
- Reset/invite tokens in URL paths (history/Referer)
- CSP allows `'unsafe-inline'` / `'unsafe-eval'` for Next + ads
- Functional weather cache / essential localStorage before banner is partly legitimate-interest / ADR-012
- Revoking advertising/analytics reloads the page to drop third-party scripts (cannot fully unload without navigation)

## Verify locally

```bash
npm run test
npm run audit:deps
```
