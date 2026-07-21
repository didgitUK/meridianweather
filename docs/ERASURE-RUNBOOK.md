# Data retention & erasure — meridian

## Automated purge

Cron: `GET /api/cron/data-retention` with `Authorization: Bearer $CRON_SECRET` (daily).

| Table | Default retention | Env override |
|-------|-------------------|--------------|
| `site_analytics_events` | 90 days | `RETENTION_ANALYTICS_DAYS` |
| `error_events` | 90 days | `RETENTION_ERROR_EVENTS_DAYS` |
| `process_runs` | 90 days | `RETENTION_PROCESS_RUNS_DAYS` |
| `email_send_log` | 90 days | `RETENTION_EMAIL_SEND_LOG_DAYS` |
| `admin_audit_log` | 180 days | `RETENTION_ADMIN_AUDIT_DAYS` |

Implementation: [`src/lib/server/data-retention.js`](../src/lib/server/data-retention.js).

## Erasure requests (manual)

1. Confirm identity for `privacy@meridianweather.co.uk` requests.
2. Subscriptions: unsubscribe token or admin mailing list delete by email.
3. Push: delete matching `push_subscriptions` endpoints if known.
4. Browser data: instruct user to clear site data / cookie preferences.
5. Analytics: rows older than retention are purged; path-only events are not joined to identity.
6. Admin accounts: deactivate via Users panel.

Document completion in `admin_audit_log` when acting on a formal request.
