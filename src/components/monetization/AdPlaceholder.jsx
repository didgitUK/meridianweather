'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getAdPlaceholderImage } from '@/constants/monetization';

/**
 * Clearly labeled demo ad when AdSense is unavailable.
 * Live adsbygoogle units never use this component.
 */
export function AdPlaceholder({
  placement = 'dashboard',
  label = 'meridian free is supported by advertising',
  href = '/docs/monetization',
  className = '',
  onOpenSettings,
  showConsentCta = false,
}) {
  const src = getAdPlaceholderImage(placement);

  return (
    <div
      role="complementary"
      aria-label={`Advertisement placeholder ${placement}`}
      className={`overflow-hidden rounded-xl border border-dashed border-border/80 bg-muted/40 p-3 text-center ${className}`}
    >
      <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        Advertisement
      </p>
      <div className="relative mx-auto flex min-h-[90px] w-full max-w-3xl items-center justify-center">
        <Image
          src={src}
          alt="Demo advertisement placeholder — AdSense not configured"
          width={728}
          height={90}
          className="h-auto max-h-[120px] w-full object-contain"
          unoptimized
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
      {href ? (
        <Link href={href} className="mt-1 inline-block text-xs underline">
          Learn about meridian monetization
        </Link>
      ) : null}
      {showConsentCta && onOpenSettings ? (
        <button type="button" className="mt-2 block w-full text-xs underline" onClick={onOpenSettings}>
          Enable advertising in settings
        </button>
      ) : null}
    </div>
  );
}
