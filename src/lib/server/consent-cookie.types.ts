/**
 * Typed entry for the consent cookie helpers (migration lane start).
 * Runtime implementation remains in consent-cookie.js until full conversion.
 */
export type ConsentFlags = {
  analytics: boolean;
  advertising: boolean;
};

export type ConsentCookieParseResult = ConsentFlags | null;
