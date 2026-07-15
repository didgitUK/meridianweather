'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AdSlot } from '@/components/monetization/AdSlot';
import { AD_PLACEMENTS } from '@/constants/platform';
import { JournalPostLocalityCard } from '@/features/weather/components/JournalPostLocalityCard';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

/**
 * @param {{
 *   schemaLinks: Array<{ href: string, label: string }>,
 * }} props
 */
export function JournalPostSidebar({ schemaLinks = [] }) {
  const t = useTranslations('Journal.post');

  return (
    <aside
      aria-label={t('sidebarLabel')}
      className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--site-header-height,4.5rem)+1rem)]"
    >
      <section
        aria-labelledby="journal-schema-title"
        className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
      >
        <h2
          id="journal-schema-title"
          className={cn(TYPOGRAPHY.heading, 'text-base')}
        >
          {t('schemaTitle')}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{t('schemaDescription')}</p>
        <ul className="mt-3 flex flex-col gap-2">
          {schemaLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <JournalPostLocalityCard />

      <section
        aria-label={t('sidebarAdLabel')}
        className="relative mx-auto aspect-square w-full max-w-[17.5rem] overflow-hidden rounded-[1.25rem]"
      >
        <AdSlot
          placement={AD_PLACEMENTS.hero}
          className="size-full min-h-0 border-0 bg-transparent p-0 shadow-none [&_[role=complementary]]:size-full [&_[role=complementary]]:rounded-[inherit]"
        />
      </section>
    </aside>
  );
}
