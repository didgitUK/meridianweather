'use client';

import Link from 'next/link';
import {
  COLOR_SCHEME_OPTIONS,
  FONT_SCALE_OPTIONS,
  REDUCED_MOTION_OPTIONS,
} from '@/constants/accessibility';
import { PreferenceSelect } from '@/components/layout/settings/PreferenceSelect';
import { PreferenceToggle } from '@/components/layout/settings/PreferenceToggle';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { useTheme } from '@/providers/ThemeProvider';

export function AccessibilityPreferencesPanel({ draft, onDraftChange }) {
  const { preferences } = useAccessibility();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Adjust display and interaction settings for this device. Changes apply immediately and are
        saved in your browser.
      </p>

      <div className="flex flex-col gap-2">
        <PreferenceSelect
          id="a11y-color-scheme"
          label="Colour scheme"
          description="Choose light, dark, or follow your operating system preference."
          value={theme}
          options={COLOR_SCHEME_OPTIONS}
          onChange={(value) => setTheme(value)}
        />

        <PreferenceSelect
          id="a11y-reduced-motion"
          label="Motion"
          description="Reduce animations and auto-advancing carousels when enabled."
          value={draft.reducedMotion}
          options={REDUCED_MOTION_OPTIONS}
          onChange={(reducedMotion) => onDraftChange({ reducedMotion })}
        />

        <PreferenceSelect
          id="a11y-font-scale"
          label="Text size"
          description="Scale interface text across the site."
          value={String(draft.fontScale)}
          options={FONT_SCALE_OPTIONS.map((option) => ({
            ...option,
            value: String(option.value),
          }))}
          onChange={(value) => onDraftChange({ fontScale: Number(value) })}
        />

        <PreferenceToggle
          id="a11y-high-contrast"
          label="High contrast"
          description="Increase contrast for text, borders, and focus states."
          checked={draft.highContrast}
          onCheckedChange={(highContrast) => onDraftChange({ highContrast })}
        />

        <PreferenceToggle
          id="a11y-underline-links"
          label="Underline links"
          description="Always underline text links for easier scanning."
          checked={draft.underlineLinks}
          onCheckedChange={(underlineLinks) => onDraftChange({ underlineLinks })}
        />

        <PreferenceToggle
          id="a11y-enhanced-focus"
          label="Enhanced focus indicators"
          description="Show stronger focus rings on keyboard navigation."
          checked={draft.enhancedFocus}
          onCheckedChange={(enhancedFocus) => onDraftChange({ enhancedFocus })}
        />

        <PreferenceToggle
          id="a11y-readable-font"
          label="Readable font"
          description="Use a system sans-serif stack optimised for legibility."
          checked={draft.readableFont}
          onCheckedChange={(readableFont) => onDraftChange({ readableFont })}
        />

        <PreferenceToggle
          id="a11y-skip-link"
          label="Skip to main content link"
          description="Show a keyboard-accessible skip link at the top of each page."
          checked={draft.showSkipLink}
          onCheckedChange={(showSkipLink) => onDraftChange({ showSkipLink })}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        See our{' '}
        <Link href="/legal/accessibility" className="underline">
          Accessibility Statement
        </Link>{' '}
        for supported features and known gaps. Saved preferences: motion{' '}
        {preferences.reducedMotion}, text {preferences.fontScale}%.
      </p>
    </div>
  );
}
