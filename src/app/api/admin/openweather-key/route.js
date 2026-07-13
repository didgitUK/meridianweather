import { NextResponse } from 'next/server';
import { getRecentAdminAuditEvents, logAdminAuditEvent } from '@/lib/admin-audit-repo';
import { getPlatformSettings } from '@/lib/platform-settings';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

function resolveOpenWeatherApiKey() {
  const settings = getPlatformSettings();
  const databaseKey = settings.openWeatherApiKey?.trim() ?? '';
  const envKey = process.env.OPENWEATHER_API_KEY?.trim() ?? '';

  if (databaseKey) {
    return { key: databaseKey, source: 'database' };
  }

  if (envKey) {
    return { key: envKey, source: 'environment' };
  }

  return { key: '', source: null };
}

export async function POST(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  const resolved = resolveOpenWeatherApiKey();
  if (!resolved.key) {
    return NextResponse.json(
      { error: 'not_configured', message: 'No OpenWeather API key is configured.' },
      { status: 404 },
    );
  }

  logAdminAuditEvent({
    action: 'openweather_api_key_viewed',
    meta: {
      source: resolved.source,
    },
  });

  return NextResponse.json({
    key: resolved.key,
    source: resolved.source,
    viewedAt: new Date().toISOString(),
  });
}

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  return NextResponse.json({
    views: getRecentAdminAuditEvents('openweather_api_key_viewed', 10),
  });
}
