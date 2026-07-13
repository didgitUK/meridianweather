import {
  ADSENSE_DATE_METRICS,
  ADSENSE_SNAPSHOT_KINDS,
} from '@/constants/adsense-reports';
import { getAdSenseOAuthEnv, refreshAdSenseAccessToken } from '@/lib/server/adsense-oauth';
import { decryptSecret } from '@/lib/server/secret-crypto';
import { getPlatformSettings, updatePlatformSettings } from '@/lib/platform-settings';

const ADSENSE_API = 'https://adsense.googleapis.com/v2';

function toApiDate(date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

/** Inclusive range ending yesterday (UTC). Earnings for “today” are unreliable. */
export function resolveReportDateBounds(rangeId) {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  end.setUTCDate(end.getUTCDate() - 1);

  const start = new Date(end);

  if (rangeId === 'mtd') {
    start.setUTCDate(1);
  } else if (rangeId === '7d') {
    start.setUTCDate(end.getUTCDate() - 6);
  } else {
    start.setUTCDate(end.getUTCDate() - 29);
  }

  return { startDate: toApiDate(start), endDate: toApiDate(end), start, end };
}

function appendDateParams(params, startDate, endDate) {
  params.set('startDate.year', String(startDate.year));
  params.set('startDate.month', String(startDate.month));
  params.set('startDate.day', String(startDate.day));
  params.set('endDate.year', String(endDate.year));
  params.set('endDate.month', String(endDate.month));
  params.set('endDate.day', String(endDate.day));
}

export function parseReportResult(result) {
  const headers = (result?.headers ?? []).map((header) => ({
    name: header.name,
    type: header.type,
    currencyCode: header.currencyCode ?? null,
  }));

  const mapCells = (row) => {
    const cells = row?.cells ?? [];
    const mapped = {};

    headers.forEach((header, index) => {
      mapped[header.name] = cells[index]?.value ?? null;
    });

    return mapped;
  };

  const rows = (result?.rows ?? []).map(mapCells);
  const totals = result?.totals ? mapCells(result.totals) : null;
  const currencyCode =
    headers.find((header) => header.currencyCode)?.currencyCode ?? null;

  return { headers, rows, totals, currencyCode };
}

async function adsenseFetch(path, accessToken, searchParams) {
  const url = new URL(`${ADSENSE_API}${path}`);

  if (searchParams) {
    for (const [key, value] of searchParams.entries()) {
      url.searchParams.append(key, value);
    }
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.error_description || `AdSense API error (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function getAdSenseReportingAdminConfig() {
  const settings = getPlatformSettings();
  const env = getAdSenseOAuthEnv();

  return {
    oauthEnvConfigured: env.configured,
    connected: Boolean(settings.adsenseOauthRefreshToken),
    accountName: settings.adsenseAccountName || null,
    accountDisplayName: settings.adsenseAccountDisplayName || null,
    currencyCode: settings.adsenseCurrencyCode || null,
    lastSyncedAt: settings.adsenseLastSyncedAt || null,
  };
}

export async function getValidAdSenseAccessToken() {
  const settings = getPlatformSettings();
  const encrypted = settings.adsenseOauthRefreshToken;

  if (!encrypted) {
    throw new Error('AdSense Management API is not connected.');
  }

  const refreshToken = decryptSecret(encrypted);
  const { accessToken } = await refreshAdSenseAccessToken(refreshToken);
  return accessToken;
}

export async function listAdSenseAccounts(accessToken) {
  const payload = await adsenseFetch('/accounts', accessToken);
  return payload.accounts ?? [];
}

export async function generateAdSenseReport({
  accessToken,
  accountName,
  dimensions = [],
  metrics,
  startDate,
  endDate,
  orderBy = [],
  limit,
}) {
  const params = new URLSearchParams();

  for (const dimension of dimensions) {
    params.append('dimensions', dimension);
  }

  for (const metric of metrics) {
    params.append('metrics', metric);
  }

  for (const order of orderBy) {
    params.append('orderBy', order);
  }

  if (limit != null) {
    params.set('limit', String(limit));
  }

  appendDateParams(params, startDate, endDate);

  const result = await adsenseFetch(`/${accountName}/reports:generate`, accessToken, params);
  return parseReportResult(result);
}

export async function fetchAdSenseReportBundle(rangeId) {
  const accessToken = await getValidAdSenseAccessToken();
  const settings = getPlatformSettings();
  let accountName = settings.adsenseAccountName;

  if (!accountName) {
    const accounts = await listAdSenseAccounts(accessToken);
    const primary = accounts[0];

    if (!primary?.name) {
      throw new Error('No AdSense account found for the connected Google user.');
    }

    accountName = primary.name;
    updatePlatformSettings({
      adsenseAccountName: primary.name,
      adsenseAccountDisplayName: primary.displayName ?? primary.name,
      adsenseCurrencyCode: primary.currencyCode ?? '',
    });
  }

  const { startDate, endDate } = resolveReportDateBounds(rangeId);

  const [byDate, byPage, byPlatform, byCountry] = await Promise.all([
    generateAdSenseReport({
      accessToken,
      accountName,
      dimensions: [ADSENSE_SNAPSHOT_KINDS.DATE],
      metrics: ADSENSE_DATE_METRICS,
      startDate,
      endDate,
      orderBy: ['+DATE'],
    }),
    generateAdSenseReport({
      accessToken,
      accountName,
      dimensions: [ADSENSE_SNAPSHOT_KINDS.PAGE_URL],
      metrics: ['ESTIMATED_EARNINGS', 'CLICKS', 'IMPRESSIONS'],
      startDate,
      endDate,
      orderBy: ['-ESTIMATED_EARNINGS'],
      limit: 15,
    }),
    generateAdSenseReport({
      accessToken,
      accountName,
      dimensions: [ADSENSE_SNAPSHOT_KINDS.PLATFORM_TYPE_NAME],
      metrics: ['ESTIMATED_EARNINGS', 'CLICKS', 'IMPRESSIONS'],
      startDate,
      endDate,
      orderBy: ['-ESTIMATED_EARNINGS'],
    }),
    generateAdSenseReport({
      accessToken,
      accountName,
      dimensions: [ADSENSE_SNAPSHOT_KINDS.COUNTRY_NAME],
      metrics: ['ESTIMATED_EARNINGS', 'CLICKS', 'IMPRESSIONS'],
      startDate,
      endDate,
      orderBy: ['-ESTIMATED_EARNINGS'],
      limit: 10,
    }),
  ]);

  const currencyCode =
    byDate.currencyCode || settings.adsenseCurrencyCode || 'USD';

  return {
    rangeId,
    accountName,
    currencyCode,
    startDate,
    endDate,
    byDate,
    byPage,
    byPlatform,
    byCountry,
    fetchedAt: new Date().toISOString(),
  };
}

export async function probeAdSenseConnection() {
  const accessToken = await getValidAdSenseAccessToken();
  const accounts = await listAdSenseAccounts(accessToken);
  return { accounts };
}
