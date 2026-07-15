# Security posture — meridian

Interview exercise + stretch admin surface. Controls below harden what already ships; they do not claim SOC2/ISO certification.

## Threat model (brief)

| Asset | Risk | Mitigation |
| --- | --- | --- |
| OpenWeather API key | Leak / quota burn | Server-only proxy; per-IP rate limits; upstream quota tracker |
| Admin sessions | Takeover / CSRF | HttpOnly cookie, HMAC (`ADMIN_SECRET`), session versioning on password change |
| Cron jobs | Unauthenticated email / alert spam | `CRON_SECRET` Bearer required in production (fail closed) |
| Subscriptions / analytics | Abuse, DB growth | Rate limits, validation, consent-gated analytics |
| Connector secrets in SQLite | DB file theft | AES-256-GCM via `ADMIN_SECRET` (`encryptSecret`) |
| Third-party scripts | XSS / tracking | Consent gates + CSP baseline |

## Production env checklist

| Variable | Role |
| --- | --- |
| `ADMIN_SECRET` | **Required** — session HMAC + secret encryption (never a login password) |
| `ADMIN_PASSWORD` | Root bootstrap login for `ADMIN_EMAIL` only |
| `CRON_SECRET` | **Required** — Bearer for `/api/cron/*` (denied if unset in production) |
| `OPENWEATHER_API_KEY` | Weather/geocode |
| `ALLOW_DEV_ADMIN_BYPASS` | Dev only (`1` + `NODE_ENV=development` + no `ADMIN_SECRET`) |

Keep real values in `.env.local` only. See `.env.example`.

## Controls in place

- **Auth:** scrypt passwords, timing-safe compares, root env unlock limited to `ADMIN_EMAIL`, invite/reset tokens (32-byte, hashed at rest, TTL, single-use)
- **Sessions:** signed cookie; `session_version` invalidates tokens after password change/reset
- **Abuse:** in-memory IP rate limits on login, forgot/reset, invite accept, subscriptions, analytics, weather batch, geocode
- **Input:** batch city cap + lat/lon/scope validation; subscription email/type/coords; alert id allowlist
- **Headers:** CSP, HSTS (production), `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`
- **Privacy:** first-party analytics / ad-view events require consent flags; AdSense/GA loaders already consent-gated
- **SQL:** parameterized `better-sqlite3` queries
- **Supply chain:** `npm run audit:deps`

## Residual risks (accepted for scope)

- In-memory rate limits are per process (not shared across replicas)
- No MFA / RBAC (flat admin trust)
- SameSite=Lax without CSRF tokens (JSON APIs); OAuth start remains GET
- Reset/invite tokens in URL paths (history/Referer)
- CSP allows `'unsafe-inline'` / `'unsafe-eval'` for Next + ads
- Functional weather cache / essential localStorage before banner is partly legitimate-interest / ADR-012

## Verify locally

```bash
npm run test
npm run audit:deps
```
