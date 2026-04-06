'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export function HtmlLangSetter() {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      document.body.dir = locale === 'ar' ? 'rtl' : 'ltr';
    }
  }, [pathname, locale]);

  return null;
}
