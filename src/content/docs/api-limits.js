export const apiLimitsDoc = {
  slug: 'api-limits',
  title: 'API limits',
  lastUpdated: '2026-07-09',
  sections: [
    {
      id: 'quota',
      title: 'Daily and per-minute quota',
      body:
        'Defaults from constants/weather.js: DAILY_LIMIT 1000, WARNING_THRESHOLD 800, SOFT_BLOCK_THRESHOLD 950, PER_MINUTE_LIMIT 60 upstream calls per rolling minute. platform_settings row can override daily_limit and soft_block_threshold (defaults seeded on first DB open). Counter resets at UTC midnight.',
    },
    {
      id: 'status',
      title: 'Status values',
      body:
        'ok — under warning threshold. warning — at or above 800 calls today. soft_block — at or above 950; upstream blocked. hard_block — at daily limit 1000. Per-minute cap also blocks upstream when 60 calls occurred in the last 60 seconds.',
    },
    {
      id: 'cache-hits',
      title: 'Cache hits vs upstream',
      body:
        'L1/L2 hits log to api_call_log with cache_hit=1 and do not increment daily upstream counter. Only successful upstream OpenWeather calls count toward quota. Emergency stale serves avoid upstream when blocked.',
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
        'GET /api/admin/usage — quota snapshot and recent calls. PATCH /api/admin/settings — body {refreshIntervalMs} updates platform_settings and affects current-scope TTL. Auth: x-admin-secret header must match ADMIN_SECRET. In development or when ADMIN_SECRET is unset, auth is bypassed (document for local/review use only).',
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
