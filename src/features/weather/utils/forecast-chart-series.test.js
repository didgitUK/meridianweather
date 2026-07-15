import { describe, expect, it } from 'vitest';
import {
  FORECAST_METRIC_TABS,
  formatMetricValue,
  getMetricValue,
} from '@/features/weather/utils/forecast-chart-series';

describe('forecast chart metrics', () => {
  it('exposes humidity and uv tabs', () => {
    const ids = FORECAST_METRIC_TABS.map((tab) => tab.id);
    expect(ids).toContain('humidity');
    expect(ids).toContain('uv');
  });

  it('reads humidity and uv from points', () => {
    const point = { humidity: 61, uvi: 4.2, temp: 18 };
    expect(getMetricValue(point, 'humidity')).toBe(61);
    expect(getMetricValue(point, 'uv')).toBe(4.2);
    expect(formatMetricValue(61, 'humidity')).toBe('61%');
    expect(formatMetricValue(4.2, 'uv')).toBe('4.2');
  });
});
