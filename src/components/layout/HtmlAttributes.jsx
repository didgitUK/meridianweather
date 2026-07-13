'use client';

import { useEffect } from 'react';

export function HtmlAttributes({ locale, dir = 'ltr' }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return null;
}
