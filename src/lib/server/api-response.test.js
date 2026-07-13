import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api-client';
import { statusFromCaughtError } from '@/lib/server/api-response';

describe('statusFromCaughtError', () => {
  it('preserves ApiError location_not_found as 404', () => {
    const error = new ApiError('Weather data not found for this location', {
      code: 'location_not_found',
      status: 404,
    });

    expect(statusFromCaughtError(error)).toEqual({
      error: 'location_not_found',
      message: 'Weather data not found for this location',
      status: 404,
    });
  });

  it('preserves ApiError service_unavailable', () => {
    const error = new ApiError('OpenWeather rejected the API key', {
      code: 'service_unavailable',
      status: 502,
    });

    expect(statusFromCaughtError(error)).toEqual({
      error: 'service_unavailable',
      message: 'OpenWeather rejected the API key',
      status: 502,
    });
  });

  it('preserves ApiError rate_limited as 429', () => {
    const error = new ApiError('OpenWeather rate limit reached', {
      code: 'rate_limited',
      status: 429,
    });

    expect(statusFromCaughtError(error).status).toBe(429);
    expect(statusFromCaughtError(error).error).toBe('rate_limited');
  });

  it('maps Invalid* validator messages to 400', () => {
    expect(statusFromCaughtError(new Error('Invalid latitude'))).toEqual({
      error: 'invalid_request',
      message: 'Invalid latitude',
      status: 400,
    });
  });

  it('maps short-query validation to 400', () => {
    expect(statusFromCaughtError(new Error('Search query must be at least 2 characters')).status).toBe(
      400,
    );
  });

  it('maps quota pause plain errors to 429', () => {
    expect(
      statusFromCaughtError(new Error('Weather updates are paused until quota resets')),
    ).toEqual({
      error: 'rate_limited',
      message: 'Weather updates are paused until quota resets',
      status: 429,
    });
  });
});
