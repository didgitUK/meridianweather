import { formatTemperature } from '@/features/weather/utils/formatWeather';

function formatDelta(value) {
  if (value == null) {
    return '—';
  }

  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value}°C`;
}

export function AdminLocationInsightGrid({ insights, historySummary }) {
  if (!insights) {
    return null;
  }

  const cards = [
    {
      label: 'Current',
      value: formatTemperature(insights.current.temperature),
      hint: insights.current.observedAt
        ? new Date(insights.current.observedAt).toLocaleString('en-GB')
        : 'No current reading',
    },
    {
      label: '30-day average',
      value: formatTemperature(insights.averages.last30Days.temperature),
      hint: `${insights.averages.last30Days.sampleSize} observations`,
    },
    {
      label: 'Same time last year',
      value: formatTemperature(insights.averages.sameTimeLastYear.temperature),
      hint: `${insights.averages.sameTimeLastYear.sampleSize} observations in comparison window`,
    },
    {
      label: 'vs last year',
      value: formatDelta(insights.comparisons.currentVsSameTimeLastYear),
      hint: 'Current temperature compared with the same period last year',
    },
    {
      label: 'vs 30-day average',
      value: formatDelta(insights.comparisons.currentVs30DayAverage),
      hint: 'Current temperature compared with the recent 30-day mean',
    },
    {
      label: 'Archive coverage',
      value: `${historySummary?.observationCount ?? 0} obs`,
      hint: `${historySummary?.archiveCount ?? 0} archived forecast points retained`,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border bg-muted/20 px-3 py-3">
          <p className="text-xs text-muted-foreground">{card.label}</p>
          <p className="mt-1 font-tabular text-lg font-medium">{card.value}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}
