'use client';

import Link from 'next/link';
import { Globe, Link2 } from 'lucide-react';
import { SOCIAL_LINKS } from '@/constants/brand';

const ICONS = {
  website: Globe,
  linkedin: Link2,
};

const footerLinkClass =
  'inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--color-header-fg)]';

export function FooterSocialLinks() {
  return (
    <ul className="flex flex-col gap-3">
      {SOCIAL_LINKS.map((link) => {
        const Icon = ICONS[link.id] ?? Globe;

        return (
          <li key={link.id}>
            <Link
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={footerLinkClass}
              style={{ color: 'var(--color-header-muted)' }}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
