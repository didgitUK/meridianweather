'use client';

import { useEffect, useRef, useState } from 'react';

import { SCROLL_TO_SECTION_START_EVENT } from '@/lib/scroll-to-section';

const SCROLL_DELTA = 8;
const MIN_SCROLL_TO_HIDE = 72;
const USER_SCROLL_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'End',
  'Home',
  'PageDown',
  'PageUp',
  ' ',
]);

export function useScrollHeaderVisibility(enabled = true) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const suppressUntilUserScroll = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    lastScrollY.current = window.scrollY;

    function enableHideOnUserScroll() {
      suppressUntilUserScroll.current = false;
    }

    function handleScrollToSection() {
      suppressUntilUserScroll.current = true;
      setIsVisible(true);
    }

    function handleScroll() {
      const currentScrollY = window.scrollY;

      if (suppressUntilUserScroll.current) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY <= 0) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const delta = currentScrollY - lastScrollY.current;

      if (delta > SCROLL_DELTA && currentScrollY > MIN_SCROLL_TO_HIDE) {
        setIsVisible(false);
      } else if (delta < -SCROLL_DELTA) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    }

    function handleKeyDown(event) {
      const target = event.target;

      if (target instanceof HTMLElement) {
        const tag = target.tagName;

        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
          return;
        }
      }

      if (USER_SCROLL_KEYS.has(event.key)) {
        enableHideOnUserScroll();
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', enableHideOnUserScroll, { passive: true });
    window.addEventListener('touchstart', enableHideOnUserScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener(SCROLL_TO_SECTION_START_EVENT, handleScrollToSection);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', enableHideOnUserScroll);
      window.removeEventListener('touchstart', enableHideOnUserScroll);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener(SCROLL_TO_SECTION_START_EVENT, handleScrollToSection);
    };
  }, [enabled]);

  return enabled ? isVisible : true;
}
