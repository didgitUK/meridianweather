'use client';

import Image from 'next/image';
import { BRAND } from '@/constants/brand';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/lib/utils';

const LOGO = {
  onDark: '/brand/logo-on-dark.png',
  onLight: '/brand/logo-on-light.png',
};

/** Intrinsic logo asset size (public/brand/logo-on-*.png). */
const LOGO_WIDTH = 716;
const LOGO_HEIGHT = 188;

const sizeConfig = {
  sm: {
    width: Math.round((LOGO_WIDTH / LOGO_HEIGHT) * 20),
    height: 20,
    className: 'h-5 w-auto max-w-[7.5rem] shrink-0 object-contain',
  },
  md: {
    width: 180,
    height: Math.round(180 * (LOGO_HEIGHT / LOGO_WIDTH)),
    className: 'h-auto w-auto max-w-[9.5rem] shrink-0 object-contain sm:max-w-[11rem] md:max-w-none',
  },
  lg: {
    width: 160,
    height: Math.round(160 * (LOGO_HEIGHT / LOGO_WIDTH)),
    className: 'h-auto w-auto max-w-[9rem] shrink-0 object-contain sm:max-w-[10rem] md:max-w-none',
  },
};

function resolveLogoSrc(variant, resolvedTheme) {
  if (variant === 'auto') {
    return resolvedTheme === 'dark' ? LOGO.onDark : LOGO.onLight;
  }

  return variant === 'on-dark' ? LOGO.onDark : LOGO.onLight;
}

export function BrandLogo({ className, size = 'md', variant = 'on-dark' }) {
  const { resolvedTheme } = useTheme();
  const config = sizeConfig[size];
  const src = resolveLogoSrc(variant, resolvedTheme);

  return (
    <Image
      src={src}
      alt={BRAND.name}
      width={config.width}
      height={config.height}
      priority={size === 'md'}
      sizes={size === 'md' ? '(max-width: 640px) 152px, 180px' : undefined}
      className={cn(config.className, className)}
      style={{ width: 'auto', height: size === 'sm' ? '1.25rem' : 'auto' }}
    />
  );
}

