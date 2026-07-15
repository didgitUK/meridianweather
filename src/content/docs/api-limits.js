export const apiLimitsDoc = {
  slug: 'api-limits',
  title: 'API limits',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'audience',
      title: 'Who this page is for',
      body:
        'This page is for people running the site. Visited weather data is shared and cache-friendly so free-tier OpenWeather limits (default 1000 calls/day) are less likely to be burned.',
    },
    {
      id: 'quota',
      title: 'Daily and per-minute quota',
      body:
        'Defaults from constants/weather.js: DAILY_LIMIT 1000, WARNING_THRESHOLD 800, SOFT_BLOCK_THRESHOLD 950, PER_MINUTE_LIMIT 60 upstream calls per rolling minute. platform_settings can override daily_limit, soft_block_threshold, warning_threshold, and per_minute_limit (defaults seeded on first DB open). Counter resets at UTC midnight.',
    },
    {
      id: 'status',
      title: 'Status values',
      body:
        'ok — under warning threshold. warning — at or above warning_threshold (default 800 calls today). soft_block — at or above soft_block_threshold (default 950); upstream blocked. hard_block — at daily_limit (default 1000). Per-minute cap also blocks upstream when per_minute_limit calls occurred in the last 60 seconds.',
    },
    {
      id: 'cache-hits',
      title: 'Cache hits vs upstream',
      body:
        'L2 database hits log to api_call_log with cache_hit=1 and do not increment the daily upstream counter. L1 memory hits are not logged to SQLite — recordCacheHit returns early when meta.layer is memory. Only successful upstream OpenWeather calls (status 200, cache_hit=0) count toward quota. Emergency stale serves avoid upstream when blocked.',
    },
    {
      id: 'admin-shortcut',
      title: 'Admin diagnostics',
      body:
        'Open /admin (after login) for used today / daily limit, remaining, status, and refresh interval settings. API: GET /api/admin/usage.',
    },
    {
      id: 'admin-api',
      title: 'Admin API',
      body:
        'GET /api/admin/usage — quota snapshot and recent calls. GET|PATCH /api/admin/config — primary admin settings API (refresh interval, connectors, digest defaults, AdSense, alert toggles, etc.). Narrow legacy: PATCH /api/admin/settings { refreshIntervalMs }. Auth: HttpOnly session cookie meridian_admin_session after /login. Signing secret is ADMIN_SECRET (not ADMIN_PASSWORD). Dev bypass when NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1, and ADMIN_SECRET unset.',
    },
    {
      id: 'openweather',
      title: 'OpenWeather provider limits',
      body:
        'meridian tracks its own upstream counter; OpenWeather may also rate-limit or reject keys independently (401, 429). The orchestrator maps these to structured API errors for the client.',
    },
    {
      id: 'emergency',
      title: 'Emergency mode',
      body:
        'When soft/hard blocked, users still see last acceptable SQLite snapshot marked freshness emergency rather than a blank error — unless no snapshot ever existed for that coordinate.',
    },
  ],
};
