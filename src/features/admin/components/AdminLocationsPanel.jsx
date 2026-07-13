'use client';

import { useState } from 'react';
import { ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/features/admin/components/AdminPanel';
import { AdminLocationHistoryDetail } from '@/features/admin/components/AdminLocationHistoryDetail';
import { ChecksLogOverview } from '@/features/admin/components/checks/ChecksLogOverview';
import { ChecksLogTabList } from '@/features/admin/components/checks/ChecksLogTabList';
import { ChecksLogTable } from '@/features/admin/components/checks/ChecksLogTable';
import { buildCsv, downloadCsv } from '@/lib/csv';

function exportLocationsCsv(locations) {
  const headers = [
    'location',
    'name',
    'country',
    'state',
    'lat',
    'lon',
    'checks',
    'latestObservedAt',
    'updatedAt',
    'locationId',
  ];

  const rows = locations.map((location) => ({
    location: location.label ?? location.name ?? 'Unknown location',
    name: location.name ?? '',
    country: location.country ?? '',
    state: location.state ?? '',
    lat: location.lat,
    lon: location.lon,
    checks: location.checkCount ?? 0,
    latestObservedAt: location.latestObservedAt ?? '',
    updatedAt: location.updatedAt ?? '',
    locationId: location.id,
  }));

  downloadCsv(
    `meridian-checks-log-locations-${new Date().toISOString().slice(0, 10)}.csv`,
    buildCsv(headers, rows),
  );
}

function LocationsList({ locations, onSelectLocation }) {
  if (!locations?.length) {
    return (
      <AdminPanel
        title="Locations"
        description="Parent locations accumulate as current-weather checks are served."
      >
        <p className="text-sm text-muted-foreground">No stored locations yet.</p>
      </AdminPanel>
    );
  }

  return (
    <AdminPanel
      title="Locations"
      description="Open a location to review its checks log and climate archive. Sorted by highest check count first."
    >
      <div className="mb-4 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => exportLocationsCsv(locations)}
        >
          <Download className="size-4" aria-hidden />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Location</th>
              <th className="py-2 pr-4 font-medium">Coordinates</th>
              <th className="py-2 pr-4 font-medium">Checks</th>
              <th className="py-2 pr-4 font-medium">Latest</th>
              <th className="py-2 pr-4 font-medium">Updated</th>
              <th className="py-2 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <tr key={location.id} className="border-b last:border-0">
                <td className="py-3 pr-4">
                  {location.label ?? location.name ?? 'Unknown location'}
                </td>
                <td className="py-3 pr-4 font-tabular">
                  {location.lat}, {location.lon}
                </td>
                <td className="py-3 pr-4 font-tabular">{location.checkCount ?? 0}</td>
                <td className="py-3 pr-4">
                  {location.latestObservedAt
                    ? new Date(location.latestObservedAt).toLocaleString('en-GB')
                    : '—'}
                </td>
                <td className="py-3 pr-4">
                  {location.updatedAt
                    ? new Date(location.updatedAt).toLocaleString('en-GB')
                    : '—'}
                </td>
                <td className="py-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => onSelectLocation(location.id)}
                  >
                    View checks
                    <ChevronRight className="size-4" aria-hidden />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPanel>
  );
}

export function AdminLocationsPanel({ locations, onRefresh }) {
  const [tab, setTab] = useState('overview');
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  if (selectedLocationId) {
    return (
      <AdminLocationHistoryDetail
        locationId={selectedLocationId}
        onBack={() => setSelectedLocationId(null)}
        onRefresh={onRefresh}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl">Checks log</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Track how weather lookups are triggered, whether they hit cache, and which ones spend API tokens.
        </p>
      </div>

      <ChecksLogTabList value={tab} onChange={setTab} />

      <div id={`checks-log-panel-${tab}`} role="tabpanel" aria-labelledby={`checks-log-tab-${tab}`}>
        {tab === 'overview' ? <ChecksLogOverview /> : null}
        {tab === 'checks' ? (
          <ChecksLogTable onSelectLocation={setSelectedLocationId} />
        ) : null}
        {tab === 'locations' ? (
          <LocationsList locations={locations} onSelectLocation={setSelectedLocationId} />
        ) : null}
      </div>
    </div>
  );
}
