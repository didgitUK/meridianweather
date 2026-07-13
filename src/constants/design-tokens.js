/**
 * Meridian design token reference for component authors.
 * CSS variables are the source of truth; this file documents Tailwind class mappings.
 *
 * @see src/design-system/tokens/
 * @see src/app/globals.css (@theme inline)
 */

/** Breakpoint reference values (match Tailwind defaults). */
export const BREAKPOINTS = {
  sm: '40rem', // 640px
  md: '48rem', // 768px
  lg: '64rem', // 1024px
  xl: '80rem', // 1280px
  '2xl': '96rem', // 1536px
};

/**
 * Fluid typography — use Tailwind classes (no breakpoint prefixes needed).
 *
 * Standard scale (auto-scales 320px → 1280px):
 *   text-xs … text-6xl
 *
 * Semantic aliases:
 *   text-display     — hero/page titles (replaces text-4xl sm:text-5xl lg:text-6xl stacks)
 *   text-display-sm  — card/panel headings (replaces text-xl sm:text-2xl)
 *   text-metric      — temperature values on cards (replaces text-4xl)
 *   text-metric-lg   — hero temperature (replaces text-5xl)
 */
export const TYPOGRAPHY = {
  display: 'text-display',
  displaySm: 'text-display-sm',
  metric: 'text-metric font-tabular',
  metricLg: 'text-metric-lg font-tabular',
  heading: 'font-heading',
  body: 'text-base',
  muted: 'text-sm text-muted-foreground',
  caption: 'text-xs text-muted-foreground',
};

/**
 * Fluid spacing — prefer over px-4 sm:px-6 / py-10 sm:py-12 breakpoint stacks.
 *
 * Layout:
 *   px-page          — horizontal page gutter
 *   py-section       — standard section vertical padding
 *   py-section-lg    — hero/large section vertical padding
 *
 * Gaps:
 *   gap-card         — card grid gap
 *   gap-stack-4/6/8  — vertical rhythm between blocks
 *
 * Tailwind spacing tokens (same values):
 *   px-page-x, py-section-y, py-section-y-lg, gap-card, gap-stack-*
 */
export const SPACING = {
  pageX: 'px-page',
  sectionY: 'py-section',
  sectionYLg: 'py-section-lg',
  cardGap: 'gap-card',
  stack4: 'gap-stack-4',
  stack6: 'gap-stack-6',
  stack8: 'gap-stack-8',
};

/**
 * Fluid icon sizing — prefer over size-4 / size-10 sm:size-12 stacks.
 *
 *   size-icon-xs  — inline UI icons (≈ size-3.5 / size-4)
 *   size-icon-sm  — button icons
 *   size-icon-md  — prominent inline icons
 *   size-icon-lg  — hero/decorative icons (≈ size-10 sm:size-12)
 */
export const ICONS = {
  xs: 'size-icon-xs shrink-0',
  sm: 'size-icon-sm shrink-0',
  md: 'size-icon-md shrink-0',
  lg: 'size-icon-lg shrink-0',
};

/**
 * Touch targets — minimum 44×44px for interactive controls on mobile.
 *
 *   min-h-touch / min-w-touch — single-axis minimum
 *   touch-target            — both axes (icon buttons, FABs)
 */
export const TOUCH = {
  minH: 'min-h-touch',
  minW: 'min-w-touch',
  target: 'min-h-touch min-w-touch',
};

/**
 * Safe-area utilities — for fixed/sticky UI above home indicators.
 *
 *   bottom-safe  — fixed bottom offset with 1rem floor
 *   pb-safe      — padding-bottom with 1rem floor
 */
export const SAFE_AREA = {
  bottom: 'bottom-safe',
  paddingBottom: 'pb-safe',
};

/**
 * Panel accordions — use `<Accordion variant="panel">` with `<AccordionItem variant="panel">`.
 * Background maps to `--color-section` (#f7f7f7 light; elevated surface in dark). Items are
 * separated by a 10px gap when stacked.
 */
export const ACCORDION = {
  panel: 'panel',
};

/**
 * Primary CTA buttons — use `<Button variant="default">`.
 * Maps to `--color-accent` / `--color-accent-foreground` (black bg + white text in light;
 * white bg + black text in dark). See `src/design-system/themes/default.css`.
 */
export const BUTTON = {
  primary: 'default',
};

/** CSS custom properties for inline styles or CSS modules. */
export const CSS_VARS = {
  pageInline: '--space-page-inline',
  sectionBlock: '--space-section-block',
  display: '--font-size-display',
  metric: '--font-size-metric',
  iconLg: '--icon-size-lg',
  imageScale: '--image-scale-factor',
  touchMin: '--touch-min',
  safeAreaBottom: '--safe-area-inset-bottom',
};
