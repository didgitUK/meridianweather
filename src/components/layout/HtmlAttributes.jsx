'use client';

import { useEffect } from 'react';
import { setActiveDateLocale } from '@/features/weather/utils/forecast-date-locale';

export function HtmlAttributes({ locale, dir = 'ltr' }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    setActiveDateLocale(locale);
  }, [locale, dir]);

  return null;
}
