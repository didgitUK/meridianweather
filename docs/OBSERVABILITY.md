# Observability — meridian

How engineers inspect **errors**, **process runs**, **email sends**, **admin mutations**, filesystem logs, and browser smoke tests.

This is a **stretch** layer for operators and reviewers. It does **not** replace DevTools for interactive debugging, and it does **not** log every anonymous weather GET (that would churn SQLite and drown signal).

## Quick map

| Sink | What | Where |
| --- | --- | --- |
| Filesystem JSONL | App + error lines | `data/logs/app-YYYY-MM-DD.jsonl`, `data/logs/error-YYYY-MM-DD.jsonl` |
| SQLite `error_events` | Durable errors (API 5xx, cron failures, client boundary) | Admin → Operations → **Error log** |
| SQLite `process_runs` | Cron job start/finish + counts | Same panel |
| SQLite `email_send_log` | Transactional send attempts (recipient redacted) | Same panel |
| SQLite `admin_audit_log` | Admin auth + config/CMS/blog/template mutations | Same panel + existing secret-view audits |
| SQLite `api_call_log` | OpenWeather quota + **failed** upstream attempts | Admin → API usage / Checks |
| SQLite `location_weather_checks` | Why each check ran | Admin → Location / Checks |
| First-party analytics | Product funnels (consent-gated) | Admin → Dashboard → Analytics — **not** browser DevTools logs |
| Playwright | Console / localStorage / API timing smoke | `npm run test:e2e` |

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `LOG_LEVEL` | `info` | `debug` \| `info` \| `warn` \| `error` |
| `LOG_TO_FILE` | on | Set `0` to disable `data/logs/*.jsonl` (console still logs) |

Tail files:

```bash
tail -f data/logs/app-$(date -u +%F).jsonl
tail -f data/logs/error-$(date -u +%F).jsonl
```

## Correlation ids

Cron runs mint a short `correlationId` on `process_runs`. API 5xx rows store the same field on `error_events` when `apiErrorFromCaught` persists. Use the id to stitch cron → error lines in JSONL / admin UI.

## Logging from code

```js
import { logger } from '@/lib/server/logger';
import { logErrorEvent } from '@/lib/error-log-repo';

logger.info('Something happened', { scope: 'my-feature', meta: { cityId } });
logErrorEvent({
  source: 'my-feature',
  message: error.message,
  stack: error.stack,
  correlationId,
});
```

Secrets and passwords are stripped; emails are redacted (`a***@domain`).

## Browser testing

```bash
# Optional: export OPENWEATHER_API_KEY for pin + waterfall assertions
npm run test:e2e
npm run test:e2e:ui
```

Spec: [`e2e/observability.smoke.spec.js`](../e2e/observability.smoke.spec.js)

- Fails on unexpected `console.error` / `pageerror`
- Seeds functional consent, then (with API key) pins a city and asserts `meridian:saved-cities`
- Records `/api/geocode` + `/api/weather` response timings into `test-results/` (soft 15s ceiling)

HTML report: `playwright-report/` (gitignored). Open with `npx playwright show-report`.

## Client → server errors

Locale error boundary calls `POST /api/client-errors` (rate-limited). Rows appear as `source: client` in **Error log**.

## Admin UI

`/admin?section=observability` — Errors, process runs, email sends, recent admin audit.

## What we intentionally do not log

- Every public weather/geocode GET as an access log
- L1 memory cache hits in `api_call_log` (SSR remount noise)
- Raw passwords, API keys, session cookies
- Third-party APM (Sentry/Datadog) — out of scope for this delivery

**Journal CMS note:** public `/journal` routes read SQLite via [`get-blog-content.js`](../src/lib/cms/get-blog-content.js). The home carousel is a client component and uses file defaults / i18n packs only (so SQLite never ships to the browser).

See also: [`DATA-INVENTORY.md`](DATA-INVENTORY.md), [`ARCHITECTURE.md`](ARCHITECTURE.md), [`SECURITY.md`](SECURITY.md).
