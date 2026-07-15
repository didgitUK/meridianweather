'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  getAdPlaceholderImage,
  isHeroAdPlacement,
  isSquareAdPlacement,
} from '@/constants/monetization';
import { cn } from '@/lib/utils';

/**
 * Default AdSense placement chrome: branded static creative on muted ground.
 * Live adsbygoogle units never use this component.
 */
export function AdPlaceholder({
  placement = 'dashboard',
  className = '',
  onOpenSettings,
  showConsentCta = false,
}) {
  const t = useTranslations('Monetization');
  const src = getAdPlaceholderImage(placement);
  const isHero = isHeroAdPlacement(placement);
  const isSquare = isSquareAdPlacement(placement);

  return (
    <div
      role="complementary"
      aria-label={`Advertisement placeholder ${placement}`}
      className={cn(
        'relative overflow-hidden',
        isHero
          ? 'absolute inset-0 size-auto rounded-[inherit] border-0 bg-transparent'
          : cn(
              'size-full min-h-0 rounded-xl border-0 bg-transparent',
              isSquare ? 'aspect-square' : 'aspect-[4466/1302] w-full min-h-[7.5rem]',
            ),
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={isSquare ? '280px' : '(max-width: 768px) 100vw, 1152px'}
        className="object-cover"
        priority={isHero}
        unoptimized
        aria-hidden
      />
      <span className="sr-only">{t('placeholderOverlay')}</span>
      {showConsentCta && onOpenSettings ? (
        <div className="absolute inset-x-0 bottom-0 flex justify-center bg-black/50 p-2">
          <button
            type="button"
            className="text-xs font-medium text-white underline underline-offset-4 hover:text-white"
            onClick={onOpenSettings}
          >
            {t('enableAdvertisingCta')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
