export const SCROLL_TO_SECTION_START_EVENT = 'meridian:scroll-to-section-start';

export function scrollToSection(sectionId) {
  if (typeof window === 'undefined') {
    return;
  }

  const element = document.getElementById(sectionId);

  if (!element) {
    return;
  }

  window.dispatchEvent(new Event(SCROLL_TO_SECTION_START_EVENT));

  const scrollMarginTop = Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  const top = element.getBoundingClientRect().top + window.scrollY - scrollMarginTop;
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  window.scrollTo({ top, behavior });
}
