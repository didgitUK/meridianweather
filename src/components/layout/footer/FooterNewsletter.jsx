'use client';

import { NewsletterSignup } from '@/features/subscriptions/components/NewsletterSignup';

export function FooterNewsletter() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-header-muted)' }}>
        Product updates and forecast features for meridianweather.co.uk.
      </p>
      <div className="[&_.text-muted-foreground]:text-[var(--color-header-muted)] [&_button]:border-[var(--color-header-border)] [&_button]:bg-[rgb(255_255_255/0.06)] [&_button]:text-[var(--color-header-fg)] [&_button]:hover:bg-[rgb(255_255_255/0.1)] [&_form]:flex-col [&_input]:border-[var(--color-header-border)] [&_input]:bg-[rgb(255_255_255/0.06)] [&_input]:text-[var(--color-header-fg)]">
        <NewsletterSignup />
      </div>
    </div>
  );
}
