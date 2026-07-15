/**
 * Root suspense fallback — sits above `[locale]/layout`, so it must NOT use
 * next-intl (`NextIntlClientProvider` is only mounted under `[locale]`).
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-[50vh] flex-1 items-center justify-center bg-[#f7f7f7]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-on-dark.png"
        alt=""
        width={120}
        height={40}
        className="h-10 w-auto opacity-80"
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}
