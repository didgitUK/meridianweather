import { randomUUID } from 'crypto';
import { ADSENSE_SNAPSHOT_KINDS } from '@/constants/adsense-reports';
import { getDb } from '@/lib/db';
import { fetchAdSenseReportBundle } from '@/lib/server/adsense-management';
import { updatePlatformSettings } from '@/lib/platform-settings';

function upsertSnapshot(rangeKey, kind, payload, fetchedAt) {
  const db = getDb();
  const existing = db
    .prepare('SELECT id FROM adsense_report_snapshots WHERE range_key = ? AND kind = ?')
    .get(rangeKey, kind);

  const payloadJson = JSON.stringify(payload);

  if (existing) {
    db.prepare(
      `UPDATE adsense_report_snapshots
       SET payload_json = ?, fetched_at = ?
       WHERE id = ?`,
    ).run(payloadJson, fetchedAt, existing.id);
    return;
  }

  db.prepare(
    `INSERT INTO adsense_report_snapshots (id, range_key, kind, payload_json, fetched_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(randomUUID(), rangeKey, kind, payloadJson, fetchedAt);
}

export function getAdSenseSnapshot(rangeKey, kind) {
  const row = getDb()
    .prepare(
      `SELECT payload_json, fetched_at
       FROM adsense_report_snapshots
       WHERE range_key = ? AND kind = ?`,
    )
    .get(rangeKey, kind);

  if (!row) {
    return null;
  }

  return {
    payload: JSON.parse(row.payload_json),
    fetchedAt: row.fetched_at,
  };
}

export function getCachedAdSenseReport(rangeKey) {
  const byDate = getAdSenseSnapshot(rangeKey, ADSENSE_SNAPSHOT_KINDS.DATE);
  const byPage = getAdSenseSnapshot(rangeKey, ADSENSE_SNAPSHOT_KINDS.PAGE_URL);
  const byPlatform = getAdSenseSnapshot(rangeKey, ADSENSE_SNAPSHOT_KINDS.PLATFORM_TYPE_NAME);
  const byCountry = getAdSenseSnapshot(rangeKey, ADSENSE_SNAPSHOT_KINDS.COUNTRY_NAME);
  const account = getAdSenseSnapshot(rangeKey, ADSENSE_SNAPSHOT_KINDS.ACCOUNT);

  if (!byDate || !account) {
    return null;
  }

  return {
    rangeId: rangeKey,
    ...account.payload,
    byDate: byDate.payload,
    byPage: byPage?.payload ?? { rows: [], totals: null },
    byPlatform: byPlatform?.payload ?? { rows: [], totals: null },
    byCountry: byCountry?.payload ?? { rows: [], totals: null },
    fetchedAt: byDate.fetchedAt,
  };
}

export function isAdSenseReportStale(fetchedAt, staleMs) {
  if (!fetchedAt) {
    return true;
  }

  return Date.now() - new Date(fetchedAt).getTime() > staleMs;
}

export async function syncAdSenseReport(rangeId) {
  const bundle = await fetchAdSenseReportBundle(rangeId);
  const fetchedAt = bundle.fetchedAt;

  upsertSnapshot(rangeId, ADSENSE_SNAPSHOT_KINDS.DATE, bundle.byDate, fetchedAt);
  upsertSnapshot(rangeId, ADSENSE_SNAPSHOT_KINDS.PAGE_URL, bundle.byPage, fetchedAt);
  upsertSnapshot(
    rangeId,
    ADSENSE_SNAPSHOT_KINDS.PLATFORM_TYPE_NAME,
    bundle.byPlatform,
    fetchedAt,
  );
  upsertSnapshot(rangeId, ADSENSE_SNAPSHOT_KINDS.COUNTRY_NAME, bundle.byCountry, fetchedAt);
  upsertSnapshot(
    rangeId,
    ADSENSE_SNAPSHOT_KINDS.ACCOUNT,
    {
      accountName: bundle.accountName,
      currencyCode: bundle.currencyCode,
      startDate: bundle.startDate,
      endDate: bundle.endDate,
    },
    fetchedAt,
  );

  updatePlatformSettings({
    adsenseLastSyncedAt: fetchedAt,
    adsenseCurrencyCode: bundle.currencyCode || '',
  });

  return getCachedAdSenseReport(rangeId);
}

export function clearAdSenseReportSnapshots() {
  getDb().prepare('DELETE FROM adsense_report_snapshots').run();
}
