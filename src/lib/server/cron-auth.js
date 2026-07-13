/**
 * Cron routes require Bearer CRON_SECRET when configured.
 * When unset (local/dev), requests are allowed — never rely on this in production.
 */
export function isCronRequestAuthorized(request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return true;
  }

  return request.headers.get('authorization') === `Bearer ${secret}`;
}
