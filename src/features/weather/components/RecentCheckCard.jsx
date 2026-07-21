'use client';

import { Link } from '@/i18n/navigation';
import { formatAge } from '@/lib/utils';
import { useNow } from '@/hooks/use-now';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { stashCheckedCity } from '@/features/cities/utils/checked-city-store';
import { buildPlaceDetailHref } from '@/features/cities/utils/weather-place-href';
import { buildCityId, cn } from '@/lib/utils';

function buildCheckHref(check) {
  if (check.lat == null || check.lon == null || !Number.isFinite(Number(check.lat)) || !Number.isFinite(Number(check.lon))) {
    return null;
  }

  return buildPlaceDetailHref({
    cityId: check.cityId,
    name: check.cityName,
    cityName: check.cityName,
    country: check.country,
    lat: check.lat,
    lon: check.lon,
    state: check.state,
    seoSlug: check.seoSlug,
  });
}

/**
 * @param {{
 *   check: object,
 *   layout?: 'carousel' | 'stack',
 * }} props
 */
export function RecentCheckCard({ check, layout = 'carousel' }) {
  const now = useNow();
  const { formatTemp } = useTemperatureUnit();
  const label = check.cityName ?? 'Recent check';
  const location = [check.cityName, check.country].filter(Boolean).join(', ') || 'Platform lookup';
  const age = check.fetchedAt ? formatAge(now - Date.parse(check.fetchedAt)) : null;
  const distanceLabel = Number.isFinite(check.distanceKm)
    ? `${Math.round(check.distanceKm)} km`
    : null;
  const href = buildCheckHref(check);
  const isStack = layout === 'stack';

  const content = isStack ? (
    <CardContent className="flex items-center gap-2.5 px-3 py-2.5">
      {check.icon ? (
        <WeatherIcon icon={check.icon} alt={check.description ?? ''} size={28} />
      ) : null}
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate font-heading text-sm leading-tight">{label}</p>
        <p className="truncate text-[0.7rem] leading-snug text-muted-foreground">
          {[distanceLabel, check.description, age].filter(Boolean).join(' · ') || location}
        </p>
      </div>
      <p className="shrink-0 font-tabular font-heading text-lg leading-none">
        {formatTemp(check.temperature)}
      </p>
    </CardContent>
  ) : (
    <CardContent className="flex flex-col gap-3 p-4">
      {check.icon ? (
        <WeatherIcon icon={check.icon} alt={check.description ?? ''} size={40} />
      ) : null}
      <div className="min-w-0 flex-1 text-left">
        <p className="font-heading text-base leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground">
          {[location, distanceLabel].filter(Boolean).join(' · ')}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="font-tabular font-heading text-xl sm:text-2xl">
            {formatTemp(check.temperature)}
          </p>
          <p className="truncate text-xs text-muted-foreground">{check.description ?? '—'}</p>
        </div>
        {age ? <p className="mt-1 text-xs text-muted-foreground">Checked {age}</p> : null}
      </div>
    </CardContent>
  );

  const cardClass = cn(
    'border border-border/80 bg-background shadow-sm ring-0',
    isStack ? 'w-full' : 'min-w-[10.5rem] shrink-0',
  );

  if (!href) {
    return <Card className={cardClass}>{content}</Card>;
  }

  return (
    <Link
      href={href}
      className={cn(
        'block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        isStack ? 'w-full' : 'min-w-[10.5rem] shrink-0',
      )}
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
      <Card className={cn(cardClass, 'transition-shadow hover:shadow-md')}>
        {content}
      </Card>
    </Link>
  );
}

export function RecentCheckCardSkeleton({ layout = 'carousel' }) {
  return (
    <Skeleton
      className={cn(
        'rounded-xl',
        layout === 'stack' ? 'h-14 w-full' : 'h-36 min-w-[10.5rem] shrink-0',
      )}
    />
  );
}
