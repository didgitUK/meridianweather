import crypto from 'crypto';

/**
 * Cron routes require Bearer CRON_SECRET.
 * Unset secret: allowed only outside production (local/test); denied in production.
 */
export function isCronRequestAuthorized(request) {
  const secret = process.env.CRON_SECRET?.trim() ?? '';

  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  const header = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(header);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
