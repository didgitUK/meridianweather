import { ADSENSE_REPORT_RANGES } from '@/constants/adsense-reports';

function toNumber(value) {
  if (value == null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatAdSenseMoney(value, currencyCode = 'USD') {
  const amount = toNumber(value);

  if (amount == null) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode || 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode || ''}`.trim();
  }
}

export function formatAdSensePercent(value) {
  const amount = toNumber(value);

  if (amount == null) {
    return '—';
  }

  // AdSense may return CTR/viewability as 0–1 or already as percent-like decimals.
  const pct = amount <= 1 ? amount * 100 : amount;
  return `${pct.toFixed(2)}%`;
}

export function formatAdSenseCount(value) {
  const amount = toNumber(value);

  if (amount == null) {
    return '—';
  }

  return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(amount);
}

export function shapeAdSenseReportForAdmin(cached) {
  if (!cached) {
    return null;
  }

  const currencyCode = cached.currencyCode || 'USD';
  const totals = cached.byDate?.totals ?? {};

  const kpis = {
    estimatedEarnings: toNumber(totals.ESTIMATED_EARNINGS),
    clicks: toNumber(totals.CLICKS),
    impressions: toNumber(totals.IMPRESSIONS),
    pageViewsCtr: toNumber(totals.PAGE_VIEWS_CTR),
    costPerClick: toNumber(totals.COST_PER_CLICK),
    impressionRpm: toNumber(totals.IMPRESSION_RPM),
    activeViewViewability: toNumber(totals.ACTIVE_VIEW_VIEWABILITY),
    adRequests: toNumber(totals.AD_REQUESTS),
  };

  const earningsSeries = (cached.byDate?.rows ?? []).map((row) => ({
    date: row.DATE,
    earnings: toNumber(row.ESTIMATED_EARNINGS) ?? 0,
    clicks: toNumber(row.CLICKS) ?? 0,
    impressions: toNumber(row.IMPRESSIONS) ?? 0,
  }));

  const topPages = (cached.byPage?.rows ?? []).map((row) => ({
    pageUrl: row.PAGE_URL || '(unknown)',
    earnings: toNumber(row.ESTIMATED_EARNINGS) ?? 0,
    clicks: toNumber(row.CLICKS) ?? 0,
    impressions: toNumber(row.IMPRESSIONS) ?? 0,
  }));

  const platforms = (cached.byPlatform?.rows ?? []).map((row) => ({
    name: row.PLATFORM_TYPE_NAME || '(unknown)',
    earnings: toNumber(row.ESTIMATED_EARNINGS) ?? 0,
    clicks: toNumber(row.CLICKS) ?? 0,
    impressions: toNumber(row.IMPRESSIONS) ?? 0,
  }));

  const countries = (cached.byCountry?.rows ?? []).map((row) => ({
    name: row.COUNTRY_NAME || '(unknown)',
    earnings: toNumber(row.ESTIMATED_EARNINGS) ?? 0,
    clicks: toNumber(row.CLICKS) ?? 0,
    impressions: toNumber(row.IMPRESSIONS) ?? 0,
  }));

  return {
    rangeId: cached.rangeId,
    rangeLabel: ADSENSE_REPORT_RANGES[cached.rangeId]?.label ?? cached.rangeId,
    currencyCode,
    startDate: cached.startDate,
    endDate: cached.endDate,
    fetchedAt: cached.fetchedAt,
    kpis,
    formatted: {
      estimatedEarnings: formatAdSenseMoney(kpis.estimatedEarnings, currencyCode),
      clicks: formatAdSenseCount(kpis.clicks),
      impressions: formatAdSenseCount(kpis.impressions),
      pageViewsCtr: formatAdSensePercent(kpis.pageViewsCtr),
      costPerClick: formatAdSenseMoney(kpis.costPerClick, currencyCode),
      impressionRpm: formatAdSenseMoney(kpis.impressionRpm, currencyCode),
      activeViewViewability: formatAdSensePercent(kpis.activeViewViewability),
      adRequests: formatAdSenseCount(kpis.adRequests),
    },
    earningsSeries,
    topPages,
    platforms,
    countries,
  };
}
