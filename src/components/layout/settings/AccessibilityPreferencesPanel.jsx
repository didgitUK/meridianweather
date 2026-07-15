'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  COLOR_SCHEME_OPTIONS,
  FONT_SCALE_OPTIONS,
  REDUCED_MOTION_OPTIONS,
} from '@/constants/accessibility';
import { PreferenceSelect } from '@/components/layout/settings/PreferenceSelect';
import { PreferenceToggle } from '@/components/layout/settings/PreferenceToggle';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { useTheme } from '@/providers/ThemeProvider';

const MOTION_LABEL_KEYS = {
  system: 'system',
  reduce: 'reduce',
  'no-preference': 'full',
};

export function AccessibilityPreferencesPanel({ draft, onDraftChange }) {
  const t = useTranslations('Settings.accessibility');
  const { preferences } = useAccessibility();
  const { theme, setTheme } = useTheme();

  const colorSchemeOptions = COLOR_SCHEME_OPTIONS.map((option) => ({
    ...option,
    label: t(`colorScheme.${option.value}`),
  }));

  const motionOptions = REDUCED_MOTION_OPTIONS.map((option) => ({
    ...option,
    label: t(`motionOptions.${MOTION_LABEL_KEYS[option.value]}`),
  }));

  const fontScaleOptions = FONT_SCALE_OPTIONS.map((option) => ({
    ...option,
    value: String(option.value),
    label: t(`fontScale.${option.value}`),
  }));

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{t('intro')}</p>

      <div className="flex flex-col gap-2">
        <PreferenceSelect
          id="a11y-color-scheme"
          label={t('colourScheme')}
          description={t('colourSchemeDescription')}
          value={theme}
          options={colorSchemeOptions}
          onChange={(value) => setTheme(value)}
        />

        <PreferenceSelect
          id="a11y-reduced-motion"
          label={t('motion')}
          description={t('motionDescription')}
          value={draft.reducedMotion}
          options={motionOptions}
          onChange={(reducedMotion) => onDraftChange({ reducedMotion })}
        />

        <PreferenceSelect
          id="a11y-font-scale"
          label={t('textSize')}
          description={t('textSizeDescription')}
          value={String(draft.fontScale)}
          options={fontScaleOptions}
          onChange={(value) => onDraftChange({ fontScale: Number(value) })}
        />

        <PreferenceToggle
          id="a11y-high-contrast"
          label={t('highContrast')}
          description={t('highContrastDescription')}
          checked={draft.highContrast}
          onCheckedChange={(highContrast) => onDraftChange({ highContrast })}
        />

        <PreferenceToggle
          id="a11y-underline-links"
          label={t('underlineLinks')}
          description={t('underlineLinksDescription')}
          checked={draft.underlineLinks}
          onCheckedChange={(underlineLinks) => onDraftChange({ underlineLinks })}
        />

        <PreferenceToggle
          id="a11y-enhanced-focus"
          label={t('enhancedFocus')}
          description={t('enhancedFocusDescription')}
          checked={draft.enhancedFocus}
          onCheckedChange={(enhancedFocus) => onDraftChange({ enhancedFocus })}
        />

        <PreferenceToggle
          id="a11y-readable-font"
          label={t('readableFont')}
          description={t('readableFontDescription')}
          checked={draft.readableFont}
          onCheckedChange={(readableFont) => onDraftChange({ readableFont })}
        />

        <PreferenceToggle
          id="a11y-skip-link"
          label={t('skipLink')}
          description={t('skipLinkDescription')}
          checked={draft.showSkipLink}
          onCheckedChange={(showSkipLink) => onDraftChange({ showSkipLink })}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        See our{' '}
        <Link href="/legal/accessibility" className="underline">
          {t('accessibilityStatement')}
        </Link>{' '}
        for supported features and known gaps. Saved preferences: motion{' '}
        {preferences.reducedMotion}, text {preferences.fontScale}%.
      </p>
    </div>
  );
}
