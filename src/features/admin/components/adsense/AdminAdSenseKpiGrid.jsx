'use client';

import { AdminMetricCard } from '@/features/admin/components/AdminMetricCard';
import { AdminPanel } from '@/features/admin/components/AdminPanel';

export function AdminAdSenseKpiGrid({ formatted, connected }) {
  const cards = [
    { label: 'Clicks', value: formatted?.clicks },
    { label: 'Impressions', value: formatted?.impressions },
    { label: 'Page-view CTR', value: formatted?.pageViewsCtr },
    { label: 'CPC', value: formatted?.costPerClick },
    { label: 'Impression RPM', value: formatted?.impressionRpm },
    { label: 'Viewability', value: formatted?.activeViewViewability },
  ];

  return (
    <AdminPanel title="Monetization health" description="Clicks, reach, and yield for the selected range.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <AdminMetricCard
            key={card.label}
            label={card.label}
            value={connected ? card.value ?? '—' : '—'}
          />
        ))}
      </div>
    </AdminPanel>
  );
}
