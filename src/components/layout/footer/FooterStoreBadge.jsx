import Image from 'next/image';
import { cn } from '@/lib/utils';

export const FOOTER_STORE_BADGE_WIDTH = 120;
export const FOOTER_STORE_BADGE_HEIGHT = 40;

const STORE_BADGES = {
  'app-store': {
    src: '/brand/app-store-badge.svg',
    alt: 'Download on the App Store',
  },
  'google-play': {
    src: '/brand/google-play-badge-trimmed.png',
    alt: 'Get it on Google Play',
  },
};

export function FooterStoreBadge({ store, href, disabled = false }) {
  const badge = STORE_BADGES[store];
  const isDisabled = disabled || !href;

  const image = (
    <Image
      src={badge.src}
      alt={badge.alt}
      width={FOOTER_STORE_BADGE_WIDTH}
      height={FOOTER_STORE_BADGE_HEIGHT}
      className="block h-10 w-[120px] object-contain object-left"
    />
  );

  const className = cn(
    'inline-flex w-fit items-center justify-start transition-opacity',
    isDisabled && 'cursor-not-allowed opacity-60',
    !isDisabled && 'hover:opacity-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/30',
  );

  if (isDisabled) {
    return (
      <span className={className} title="Coming soon">
        {image}
      </span>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {image}
    </a>
  );
}
