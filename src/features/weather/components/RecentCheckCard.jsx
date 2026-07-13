'use client';

import { Link } from '@/i18n/navigation';
import { formatAge } from '@/lib/utils';
import { useNow } from '@/hooks/use-now';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { stashCheckedCity } from '@/features/cities/utils/checked-city-store';
import { buildCityId } from '@/lib/utils';

function buildCheckHref(check) {
  if (!check.lat || !check.lon) {
    return null;
  }

  const cityId = check.cityId
    ?? (check.cityName ? buildCityId(check.cityName, check.country ?? 'XX', check.lat) : null);

  if (!cityId) {
    return null;
  }

  return `/city/${encodeURIComponent(cityId)}`;
}

export function RecentCheckCard({ check }) {
  const now = useNow();
  const { formatTemp } = useTemperatureUnit();
  const label = check.cityName ?? 'Recent check';
  const location = [check.cityName, check.country].filter(Boolean).join(', ') || 'Platform lookup';
  const age = check.fetchedAt ? formatAge(now - Date.parse(check.fetchedAt)) : null;
  const href = buildCheckHref(check);

  const content = (
    <CardContent className="flex flex-col gap-3 p-4">
      <div>
        <p className="font-heading text-base leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground">{location}</p>
      </div>
      <div className="flex items-center gap-3">
        {check.icon ? (
          <WeatherIcon icon={check.icon} alt={check.description ?? ''} size={40} />
        ) : null}
        <div>
          <p className="font-tabular font-heading text-2xl">
            {formatTemp(check.temperature)}
          </p>
          <p className="text-xs text-muted-foreground">{check.description ?? '—'}</p>
        </div>
      </div>
      {age ? <p className="text-xs text-muted-foreground">Checked {age}</p> : null}
    </CardContent>
  );

  if (!href) {
    return (
      <Card className="min-w-[10.5rem] shrink-0 border border-border/80 bg-background shadow-sm ring-0">
        {content}
      </Card>
    );
  }

  return (
    <Link
      href={href}
      className="block min-w-[10.5rem] shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      onClick={() => {
        if (check.cityName && check.lat != null && check.lon != null) {
          stashCheckedCity({
            id: check.cityId ?? buildCityId(check.cityName, check.country ?? 'XX', check.lat),
            name: check.cityName,
            country: check.country,
            lat: check.lat,
            lon: check.lon,
          });
        }
      }}
    >
      <Card className="border border-border/80 bg-background shadow-sm ring-0 transition-shadow hover:shadow-md">
        {content}
      </Card>
    </Link>
  );
}

export function RecentCheckCardSkeleton() {
  return <Skeleton className="h-36 min-w-[10.5rem] shrink-0 rounded-xl" />;
}
