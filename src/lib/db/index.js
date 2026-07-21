import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import {
  DAILY_LIMIT,
  DEFAULT_REFRESH_INTERVAL_MS,
  DEFAULT_STALE_CACHE_MAX_MS,
  MAX_SAVED_CITIES,
  PER_MINUTE_LIMIT,
  SOFT_BLOCK_THRESHOLD,
  WARNING_THRESHOLD,
} from '@/constants/weather';

let db;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS weather_snapshots (
  id TEXT PRIMARY KEY,
  lat REAL,
  lon REAL,
  scope TEXT NOT NULL,
  cache_key TEXT NOT NULL UNIQUE,
  payload_json TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  stale_until TEXT NOT NULL,
  source TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS api_call_log (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  cache_hit INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  duration_ms INTEGER,
  meta_json TEXT
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  meta_json TEXT
);

CREATE TABLE IF NOT EXISTS error_events (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  level TEXT NOT NULL,
  source TEXT NOT NULL,
  message TEXT NOT NULL,
  stack TEXT,
  correlation_id TEXT,
  meta_json TEXT
);

CREATE TABLE IF NOT EXISTS process_runs (
  id TEXT PRIMARY KEY,
  job TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  correlation_id TEXT,
  counts_json TEXT,
  error_summary TEXT,
  meta_json TEXT
);

CREATE TABLE IF NOT EXISTS email_send_log (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  provider TEXT NOT NULL,
  template_slug TEXT,
  recipient_fingerprint TEXT NOT NULL,
  status TEXT NOT NULL,
  reason TEXT,
  correlation_id TEXT,
  meta_json TEXT
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  city_name TEXT,
  city_lat REAL,
  city_lon REAL,
  frequency TEXT,
  alert_on_rain INTEGER DEFAULT 0,
  alert_on_storm INTEGER DEFAULT 0,
  alert_prefs_json TEXT NOT NULL DEFAULT '{}',
  active INTEGER DEFAULT 1,
  unsubscribe_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscription_send_log (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL,
  city_lat REAL,
  city_lon REAL,
  condition TEXT,
  sent_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  refresh_interval_ms INTEGER NOT NULL,
  stale_cache_max_ms INTEGER NOT NULL,
  daily_limit INTEGER NOT NULL,
  soft_block_threshold INTEGER NOT NULL,
  max_saved_cities INTEGER NOT NULL DEFAULT 10,
  warning_threshold INTEGER NOT NULL DEFAULT 800,
  per_minute_limit INTEGER NOT NULL DEFAULT 60,
  adsense_client_id TEXT NOT NULL DEFAULT '',
  adsense_slot_dashboard TEXT NOT NULL DEFAULT '',
  adsense_enabled INTEGER NOT NULL DEFAULT 1,
  openweather_api_key TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  name TEXT,
  country TEXT,
  state TEXT,
  label TEXT,
  inaccurate_report_active INTEGER NOT NULL DEFAULT 0,
  inaccurate_reported_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(lat, lon)
);

CREATE TABLE IF NOT EXISTS location_weather_checks (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL,
  scope TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  source TEXT NOT NULL,
  "trigger" TEXT NOT NULL DEFAULT 'unknown',
  cache_outcome TEXT NOT NULL DEFAULT 'upstream',
  tokens_used INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS weather_observations (
  id TEXT PRIMARY KEY,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  observed_at TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  UNIQUE(lat, lon, observed_at)
);

CREATE TABLE IF NOT EXISTS weather_forecast_archive (
  id TEXT PRIMARY KEY,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  scope TEXT NOT NULL,
  valid_at TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  UNIQUE(lat, lon, scope, valid_at, issued_at)
);

CREATE TABLE IF NOT EXISTS hero_image_cache (
  cache_key TEXT PRIMARY KEY,
  image_url TEXT,
  blur_hash TEXT,
  photographer TEXT,
  photographer_url TEXT,
  unsplash_url TEXT,
  query_used TEXT,
  portrait_image_url TEXT,
  portrait_blur_hash TEXT,
  portrait_photographer TEXT,
  portrait_photographer_url TEXT,
  portrait_unsplash_url TEXT,
  portrait_query_used TEXT,
  dual_resolved INTEGER NOT NULL DEFAULT 0,
  fetched_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS adsense_report_snapshots (
  id TEXT PRIMARY KEY,
  range_key TEXT NOT NULL,
  kind TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  UNIQUE(range_key, kind)
);

CREATE TABLE IF NOT EXISTS site_analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '',
  session_id TEXT NOT NULL,
  slot_id TEXT NOT NULL DEFAULT '',
  value REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_site_analytics_created
  ON site_analytics_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_site_analytics_type_created
  ON site_analytics_events(event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS email_templates (
  slug TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_pages (
  collection TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  last_updated TEXT NOT NULL,
  content_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (collection, slug)
);

CREATE TABLE IF NOT EXISTS blog_posts (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL,
  date_iso TEXT NOT NULL,
  date_label TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  body_html TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  session_version INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS admin_invites (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  invited_by TEXT,
  expires_at TEXT NOT NULL,
  accepted_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_invites_email
  ON admin_invites(email);

CREATE TABLE IF NOT EXISTS admin_password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_password_resets_user
  ON admin_password_resets(user_id);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action
  ON admin_audit_log(action, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_error_events_timestamp
  ON error_events(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_error_events_source
  ON error_events(source, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_process_runs_started
  ON process_runs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_send_log_timestamp
  ON email_send_log(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_admin_users_email
  ON admin_users(email);

CREATE INDEX IF NOT EXISTS idx_locations_updated
  ON locations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_location_checks_lookup
  ON location_weather_checks(location_id, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_weather_observations_lookup
  ON weather_observations(lat, lon, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_weather_forecast_archive_lookup
  ON weather_forecast_archive(lat, lon, scope, valid_at DESC);

CREATE TABLE IF NOT EXISTS uk_places (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'GB',
  admin_area TEXT,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  population INTEGER NOT NULL DEFAULT 0,
  place_type TEXT NOT NULL DEFAULT 'town',
  tier INTEGER NOT NULL DEFAULT 1,
  city_slug TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TEXT,
  last_fetched_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_uk_places_population
  ON uk_places(population DESC);

CREATE INDEX IF NOT EXISTS idx_uk_places_tier_population
  ON uk_places(tier, population DESC);

CREATE INDEX IF NOT EXISTS idx_uk_places_city_slug
  ON uk_places(city_slug);

CREATE TABLE IF NOT EXISTS weather_places (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  admin_area TEXT,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  population INTEGER NOT NULL DEFAULT 0,
  place_type TEXT NOT NULL DEFAULT 'city',
  tier INTEGER NOT NULL DEFAULT 3,
  city_slug TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TEXT,
  last_fetched_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_weather_places_country_slug
  ON weather_places(country, slug);

CREATE INDEX IF NOT EXISTS idx_weather_places_population
  ON weather_places(population DESC);

CREATE TABLE IF NOT EXISTS adfree_licenses (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_session_id TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adfree_licenses_customer
  ON adfree_licenses(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_adfree_licenses_session
  ON adfree_licenses(stripe_session_id);
`;

const PLATFORM_SETTING_MIGRATIONS = [
  'ALTER TABLE platform_settings ADD COLUMN max_saved_cities INTEGER NOT NULL DEFAULT 10',
  'ALTER TABLE platform_settings ADD COLUMN warning_threshold INTEGER NOT NULL DEFAULT 800',
  'ALTER TABLE platform_settings ADD COLUMN per_minute_limit INTEGER NOT NULL DEFAULT 60',
  'ALTER TABLE platform_settings ADD COLUMN adsense_client_id TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN adsense_slot_dashboard TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN adsense_enabled INTEGER NOT NULL DEFAULT 1',
  'ALTER TABLE platform_settings ADD COLUMN openweather_api_key TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN inaccuracy_auto_dismiss_enabled INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE platform_settings ADD COLUMN inaccuracy_auto_dismiss_days INTEGER NOT NULL DEFAULT 7',
  'ALTER TABLE platform_settings ADD COLUMN email_provider TEXT NOT NULL DEFAULT \'none\'',
  'ALTER TABLE platform_settings ADD COLUMN resend_api_key TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN resend_from_email TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN resend_audience_id TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN sendgrid_api_key TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN sendgrid_from_email TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN sendgrid_list_id TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN email_last_synced_at TEXT',
  'ALTER TABLE platform_settings ADD COLUMN ses_access_key_id TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN ses_secret_access_key TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN ses_region TEXT NOT NULL DEFAULT \'eu-west-1\'',
  'ALTER TABLE platform_settings ADD COLUMN ses_from_email TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN smtp_host TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN smtp_port INTEGER NOT NULL DEFAULT 587',
  'ALTER TABLE platform_settings ADD COLUMN smtp_user TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN smtp_password TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN smtp_from_email TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN smtp_secure INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE platform_settings ADD COLUMN adsense_oauth_refresh_token TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN adsense_account_name TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN adsense_account_display_name TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN adsense_currency_code TEXT NOT NULL DEFAULT \'\'',
  'ALTER TABLE platform_settings ADD COLUMN adsense_last_synced_at TEXT',
  'ALTER TABLE platform_settings ADD COLUMN open_meteo_alerts_enabled INTEGER NOT NULL DEFAULT 1',
  'ALTER TABLE platform_settings ADD COLUMN nws_alerts_enabled INTEGER NOT NULL DEFAULT 1',
  'ALTER TABLE platform_settings ADD COLUMN wind_alert_threshold_ms INTEGER NOT NULL DEFAULT 15',
  'ALTER TABLE platform_settings ADD COLUMN weekly_digest_frequency_default TEXT NOT NULL DEFAULT \'weekly\'',
  'ALTER TABLE platform_settings ADD COLUMN weekly_digest_day_of_week INTEGER NOT NULL DEFAULT 1',
];

const SUBSCRIPTION_MIGRATIONS = [
  'ALTER TABLE subscriptions ADD COLUMN alert_prefs_json TEXT NOT NULL DEFAULT \'{}\'',
];

const ADMIN_USER_MIGRATIONS = [
  'ALTER TABLE admin_users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0',
];

const LOCATION_MIGRATIONS = [
  'ALTER TABLE locations ADD COLUMN inaccurate_report_active INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE locations ADD COLUMN inaccurate_reported_at TEXT',
  'ALTER TABLE locations ADD COLUMN city_slug TEXT',
  'ALTER TABLE locations ADD COLUMN indexable_at TEXT',
];

const HERO_IMAGE_CACHE_MIGRATIONS = [
  'ALTER TABLE hero_image_cache ADD COLUMN portrait_image_url TEXT',
  'ALTER TABLE hero_image_cache ADD COLUMN portrait_blur_hash TEXT',
  'ALTER TABLE hero_image_cache ADD COLUMN portrait_photographer TEXT',
  'ALTER TABLE hero_image_cache ADD COLUMN portrait_photographer_url TEXT',
  'ALTER TABLE hero_image_cache ADD COLUMN portrait_unsplash_url TEXT',
  'ALTER TABLE hero_image_cache ADD COLUMN portrait_query_used TEXT',
  'ALTER TABLE hero_image_cache ADD COLUMN dual_resolved INTEGER NOT NULL DEFAULT 0',
];

const LOCATION_INDEX_MIGRATIONS = [
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_city_slug ON locations(city_slug)',
  'CREATE INDEX IF NOT EXISTS idx_locations_indexable ON locations(indexable_at DESC)',
];

const LOCATION_CHECK_COLUMN_MIGRATIONS = [
  'ALTER TABLE location_weather_checks ADD COLUMN "trigger" TEXT NOT NULL DEFAULT \'unknown\'',
  'ALTER TABLE location_weather_checks ADD COLUMN cache_outcome TEXT NOT NULL DEFAULT \'upstream\'',
  'ALTER TABLE location_weather_checks ADD COLUMN tokens_used INTEGER NOT NULL DEFAULT 1',
];

const LOCATION_CHECK_INDEX_MIGRATIONS = [
  'CREATE INDEX IF NOT EXISTS idx_location_checks_recorded ON location_weather_checks(recorded_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_location_checks_trigger ON location_weather_checks("trigger", recorded_at DESC)',
];

function migratePlatformSettings(database) {
  for (const statement of PLATFORM_SETTING_MIGRATIONS) {
    try {
      database.exec(statement);
    } catch {
      // Column already exists.
    }
  }

  // Historical default was `resend` even when unused. Treat that as disconnected
  // so the picker shows until a connector is explicitly activated.
  try {
    database
      .prepare(
        `UPDATE platform_settings
         SET email_provider = 'none'
         WHERE id = 1
           AND email_provider = 'resend'
           AND TRIM(COALESCE(resend_api_key, '')) = ''`,
      )
      .run();
  } catch {
    // Column unavailable on very early schemas.
  }
}

function migrateAdminUsers(database) {
  for (const statement of ADMIN_USER_MIGRATIONS) {
    try {
      database.exec(statement);
    } catch {
      // Column already exists.
    }
  }
}

function migrateSubscriptions(database) {
  for (const statement of SUBSCRIPTION_MIGRATIONS) {
    try {
      database.exec(statement);
    } catch {
      // Column already exists.
    }
  }

  try {
    const rows = database
      .prepare(
        `SELECT id, alert_on_rain, alert_on_storm, alert_prefs_json
         FROM subscriptions
         WHERE type = 'city_alerts'`,
      )
      .all();

    const update = database.prepare(
      'UPDATE subscriptions SET alert_prefs_json = ? WHERE id = ?',
    );

    for (const row of rows) {
      const raw = row.alert_prefs_json ?? '{}';
      let parsed = {};
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = {};
      }

      if (Object.keys(parsed).length > 0) continue;

      update.run(
        JSON.stringify({
          rain: Boolean(row.alert_on_rain),
          thunderstorm: Boolean(row.alert_on_storm),
        }),
        row.id,
      );
    }
  } catch {
    // Table may not exist yet on first boot.
  }
}

function migrateLocations(database) {
  for (const statement of LOCATION_MIGRATIONS) {
    try {
      database.exec(statement);
    } catch {
      // Column already exists.
    }
  }

  for (const statement of LOCATION_INDEX_MIGRATIONS) {
    try {
      database.exec(statement);
    } catch {
      // Index already exists.
    }
  }

  migrateLocationChecks(database);
}

function migrateLocationChecks(database) {
  for (const statement of LOCATION_CHECK_COLUMN_MIGRATIONS) {
    try {
      database.exec(statement);
    } catch {
      // Column already exists.
    }
  }

  try {
    const tableSql = database
      .prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'location_weather_checks'`)
      .get()?.sql ?? '';

    if (tableSql.includes('UNIQUE(location_id, scope, observed_at)')) {
      database.exec(`
        CREATE TABLE location_weather_checks_new (
          id TEXT PRIMARY KEY,
          location_id TEXT NOT NULL,
          scope TEXT NOT NULL,
          observed_at TEXT NOT NULL,
          recorded_at TEXT NOT NULL,
          payload_json TEXT NOT NULL,
          source TEXT NOT NULL,
          "trigger" TEXT NOT NULL DEFAULT 'unknown',
          cache_outcome TEXT NOT NULL DEFAULT 'upstream',
          tokens_used INTEGER NOT NULL DEFAULT 1,
          FOREIGN KEY (location_id) REFERENCES locations(id)
        );
        INSERT INTO location_weather_checks_new (
          id, location_id, scope, observed_at, recorded_at, payload_json, source,
          "trigger", cache_outcome, tokens_used
        )
        SELECT
          id, location_id, scope, observed_at, recorded_at, payload_json, source,
          COALESCE("trigger", 'unknown'),
          COALESCE(cache_outcome, 'upstream'),
          COALESCE(tokens_used, 1)
        FROM location_weather_checks;
        DROP TABLE location_weather_checks;
        ALTER TABLE location_weather_checks_new RENAME TO location_weather_checks;
        CREATE INDEX IF NOT EXISTS idx_location_checks_lookup
          ON location_weather_checks(location_id, observed_at DESC);
      `);
    }
  } catch {
    // Rebuild already applied or table unavailable.
  }

  for (const statement of LOCATION_CHECK_INDEX_MIGRATIONS) {
    try {
      database.exec(statement);
    } catch {
      // Index already exists.
    }
  }
}

function migrateHeroImageCache(database) {
  for (const statement of HERO_IMAGE_CACHE_MIGRATIONS) {
    try {
      database.exec(statement);
    } catch {
      // Column already exists.
    }
  }

  try {
    const columns = database.prepare('PRAGMA table_info(hero_image_cache)').all();
    const imageUrlCol = columns.find((col) => col.name === 'image_url');

    if (imageUrlCol?.notnull === 1) {
      database.exec(`
        CREATE TABLE hero_image_cache_new (
          cache_key TEXT PRIMARY KEY,
          image_url TEXT,
          blur_hash TEXT,
          photographer TEXT,
          photographer_url TEXT,
          unsplash_url TEXT,
          query_used TEXT,
          portrait_image_url TEXT,
          portrait_blur_hash TEXT,
          portrait_photographer TEXT,
          portrait_photographer_url TEXT,
          portrait_unsplash_url TEXT,
          portrait_query_used TEXT,
          dual_resolved INTEGER NOT NULL DEFAULT 0,
          fetched_at TEXT NOT NULL,
          expires_at TEXT NOT NULL
        );
        INSERT INTO hero_image_cache_new (
          cache_key, image_url, blur_hash, photographer, photographer_url, unsplash_url, query_used,
          portrait_image_url, portrait_blur_hash, portrait_photographer,
          portrait_photographer_url, portrait_unsplash_url, portrait_query_used,
          dual_resolved, fetched_at, expires_at
        )
        SELECT
          cache_key, image_url, blur_hash, photographer, photographer_url, unsplash_url, query_used,
          portrait_image_url, portrait_blur_hash, portrait_photographer,
          portrait_photographer_url, portrait_unsplash_url, portrait_query_used,
          COALESCE(dual_resolved, 0), fetched_at, expires_at
        FROM hero_image_cache;
        DROP TABLE hero_image_cache;
        ALTER TABLE hero_image_cache_new RENAME TO hero_image_cache;
      `);
    }
  } catch {
    // Rebuild already applied or table unavailable.
  }
}

/**
 * Reclassify historic untagged checks so analytics never shows a vague "Unknown" spend bucket.
 */
function migrateWeatherCheckTriggers(database) {
  try {
    database
      .prepare(
        `UPDATE location_weather_checks
         SET "trigger" = 'legacy_untagged'
         WHERE "trigger" IS NULL OR "trigger" = '' OR "trigger" = 'unknown'`,
      )
      .run();
  } catch {
    // Table may not exist yet on brand-new installs.
  }
}

function migrateUkPlaces(database) {
  try {
    database.exec(`
      CREATE TABLE IF NOT EXISTS uk_places (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        country TEXT NOT NULL DEFAULT 'GB',
        admin_area TEXT,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        population INTEGER NOT NULL DEFAULT 0,
        place_type TEXT NOT NULL DEFAULT 'town',
        tier INTEGER NOT NULL DEFAULT 1,
        city_slug TEXT,
        view_count INTEGER NOT NULL DEFAULT 0,
        last_viewed_at TEXT,
        last_fetched_at TEXT,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_uk_places_population
        ON uk_places(population DESC);
      CREATE INDEX IF NOT EXISTS idx_uk_places_tier_population
        ON uk_places(tier, population DESC);
      CREATE INDEX IF NOT EXISTS idx_uk_places_city_slug
        ON uk_places(city_slug);
    `);
  } catch {
    // Table already present.
  }

  const ukPlaceColumnMigrations = [
    'ALTER TABLE uk_places ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0',
    'ALTER TABLE uk_places ADD COLUMN last_viewed_at TEXT',
    'ALTER TABLE uk_places ADD COLUMN last_fetched_at TEXT',
  ];

  for (const statement of ukPlaceColumnMigrations) {
    try {
      database.exec(statement);
    } catch {
      // Column already exists.
    }
  }

  try {
    database.exec(
      'CREATE INDEX IF NOT EXISTS idx_uk_places_view_count ON uk_places(view_count DESC)',
    );
  } catch {
    // Index may fail until columns exist; ignored on retry.
  }

  try {
    database.exec(`
      CREATE TABLE IF NOT EXISTS weather_places (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        admin_area TEXT,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        population INTEGER NOT NULL DEFAULT 0,
        place_type TEXT NOT NULL DEFAULT 'city',
        tier INTEGER NOT NULL DEFAULT 3,
        city_slug TEXT,
        view_count INTEGER NOT NULL DEFAULT 0,
        last_viewed_at TEXT,
        last_fetched_at TEXT,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_weather_places_country_slug
        ON weather_places(country, slug);
      CREATE INDEX IF NOT EXISTS idx_weather_places_population
        ON weather_places(population DESC);
    `);
  } catch {
    // Table already present.
  }

  try {
    database.exec(`
      CREATE TABLE IF NOT EXISTS adfree_licenses (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        plan TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        stripe_session_id TEXT,
        expires_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_adfree_licenses_customer
        ON adfree_licenses(stripe_customer_id);
      CREATE INDEX IF NOT EXISTS idx_adfree_licenses_session
        ON adfree_licenses(stripe_session_id);
    `);
  } catch {
    // Table already present.
  }
}

export function getDb() {
  if (db) return db;

  const absolutePath = process.env.DATABASE_PATH
    ? (path.isAbsolute(process.env.DATABASE_PATH)
      ? process.env.DATABASE_PATH
      : path.join(/* turbopackIgnore: true */ process.cwd(), process.env.DATABASE_PATH))
    : path.join(/* turbopackIgnore: true */ process.cwd(), 'data', 'meridian.db');

  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  db = new Database(absolutePath);
  // Concurrent readers/writers (dev + tests + build) need WAL + wait instead of SQLITE_BUSY.
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  db.exec(SCHEMA);
  migratePlatformSettings(db);
  migrateAdminUsers(db);
  migrateSubscriptions(db);
  migrateLocations(db);
  migrateHeroImageCache(db);
  migrateWeatherCheckTriggers(db);
  migrateUkPlaces(db);

  const existing = db.prepare('SELECT id FROM platform_settings WHERE id = 1').get();
  if (!existing) {
    db.prepare(
      `INSERT INTO platform_settings (
         id, refresh_interval_ms, stale_cache_max_ms, daily_limit, soft_block_threshold,
         max_saved_cities, warning_threshold, per_minute_limit,
         adsense_client_id, adsense_slot_dashboard, adsense_enabled, openweather_api_key, updated_at
       ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, '', '', 1, '', ?)`,
    ).run(
      DEFAULT_REFRESH_INTERVAL_MS,
      DEFAULT_STALE_CACHE_MAX_MS,
      DAILY_LIMIT,
      SOFT_BLOCK_THRESHOLD,
      MAX_SAVED_CITIES,
      WARNING_THRESHOLD,
      PER_MINUTE_LIMIT,
      new Date().toISOString(),
    );
  }

  return db;
}
