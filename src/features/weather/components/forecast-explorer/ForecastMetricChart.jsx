'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { TEMPERATURE_UNIT } from '@/constants/temperature-unit';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import {
  buildChartAxisLabels,
  buildChartSeries,
  formatMetricValue,
  FORECAST_METRIC_TABS,
} from '@/features/weather/utils/forecast-explorer';

const CHART_WIDTH = 960;
const CHART_HEIGHT = 220;
const CHART_PADDING = { top: 28, right: 16, bottom: 36, left: 16 };

const METRIC_COLORS = {
  temperature: '#f59e0b',
  precipitation: '#38bdf8',
  wind: '#34d399',
};

function buildPath(points, min, max, width, height, metricId, timezone, timezoneOffset = null, unit = TEMPERATURE_UNIT.CELSIUS) {
  const usableWidth = width - CHART_PADDING.left - CHART_PADDING.right;
  const usableHeight = height - CHART_PADDING.top - CHART_PADDING.bottom;
  const validPoints = points.filter((point) => point.value != null);

  if (validPoints.length === 0) {
    return { linePath: '', areaPath: '', labels: [], axisLabels: [] };
  }

  const xStep = validPoints.length > 1 ? usableWidth / (validPoints.length - 1) : 0;

  const coordinates = validPoints.map((point, index) => {
    const x = CHART_PADDING.left + index * xStep;
    const normalized = (point.value - min) / (max - min || 1);
    const y = CHART_PADDING.top + usableHeight - normalized * usableHeight;

    return { ...point, x, y };
  });

  const linePath = coordinates
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const baseline = CHART_PADDING.top + usableHeight;
  const areaPath = `${linePath} L ${coordinates[coordinates.length - 1].x} ${baseline} L ${coordinates[0].x} ${baseline} Z`;

  const labelIndexes = new Set(
    coordinates.length <= 6
      ? coordinates.map((_, index) => index)
      : [0, Math.floor(coordinates.length / 3), Math.floor((coordinates.length * 2) / 3), coordinates.length - 1],
  );

  const labels = coordinates
    .filter((_, index) => labelIndexes.has(index))
    .map((point) => ({
      x: point.x,
      y: point.y,
      text: formatMetricValue(point.value, metricId, unit),
    }));

  const axisLabels = buildChartAxisLabels(coordinates, timezone, timezoneOffset);

  return { linePath, areaPath, labels, axisLabels };
}

export function ForecastMetricChart({
  points,
  timezone,
  timezoneOffset = null,
  emptyMessage = 'No chart data for this day.',
}) {
  const { unit } = useTemperatureUnit();
  const [metricId, setMetricId] = useState('temperature');
  const color = METRIC_COLORS[metricId];

  const series = useMemo(() => buildChartSeries(points, metricId), [points, metricId]);

  const chart = useMemo(() => {
    return buildPath(
      series.points,
      series.min,
      series.max,
      CHART_WIDTH,
      CHART_HEIGHT,
      metricId,
      timezone,
      timezoneOffset,
      unit,
    );
  }, [metricId, series, timezone, timezoneOffset, unit]);

  const hasValues = series.points.some((point) => point.value != null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-6 border-b border-border/70">
        {FORECAST_METRIC_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMetricId(tab.id)}
            className={cn(
              'relative pb-3 text-sm font-medium transition-colors',
              metricId === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
            {metricId === tab.id ? (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full"
                style={{ backgroundColor: color }}
              />
            ) : null}
          </button>
        ))}
      </div>

      {!hasValues ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-auto w-full min-w-[640px]"
            role="img"
            aria-label={`${metricId} forecast chart`}
          >
            <defs>
              <linearGradient id={`forecast-gradient-${metricId}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {chart.areaPath ? (
              <path d={chart.areaPath} fill={`url(#forecast-gradient-${metricId})`} />
            ) : null}

            {chart.linePath ? (
              <path d={chart.linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            ) : null}

            {chart.labels?.map((label) => (
              <text
                key={`${label.x}-${label.text}`}
                x={label.x}
                y={label.y - 10}
                textAnchor="middle"
                className="fill-foreground text-[12px] font-medium"
              >
                {label.text}
              </text>
            ))}

            {chart.axisLabels?.map((label) => (
              <text
                key={`${label.x}-${label.text}`}
                x={label.x}
                y={CHART_HEIGHT - 10}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                {label.text}
              </text>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}
