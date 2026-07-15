'use client';

import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import { scrollToSection } from '@/lib/scroll-to-section';

function getHashId() {
  if (typeof window === 'undefined') {
    return '';
  }

  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) {
    return '';
  }

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function scrollWindowToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function scrollToHashTarget(hashId) {
  if (!hashId) {
    return false;
  }

  if (document.getElementById(hashId)) {
    scrollToSection(hashId);
    return true;
  }

  return false;
}

/**
 * Always land at the top of a route after navigation, except when the URL
 * includes a hash targeting specific content (#section-id).
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const hashId = getHashId();

    if (hashId) {
      // Soft navigations often paint before the target exists — retry briefly.
      if (scrollToHashTarget(hashId)) {
        return undefined;
      }

      let attempts = 0;
      const timer = window.setInterval(() => {
        attempts += 1;
        if (scrollToHashTarget(hashId) || attempts >= 20) {
          window.clearInterval(timer);
        }
      }, 50);

      return () => window.clearInterval(timer);
    }

    scrollWindowToTop();
    return undefined;
  }, [pathname]);

  useEffect(() => {
    function handleHashChange() {
      const hashId = getHashId();
      if (!hashId) {
        return;
      }
      scrollToHashTarget(hashId);
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return null;
}
