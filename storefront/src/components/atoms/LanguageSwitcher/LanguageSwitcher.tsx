'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    
    const currentPath = pathname.replace(/^\/(ar|en)/, '');
    const newPath = `/${newLocale}${currentPath || ''}`;
    
    startTransition(() => {
      router.push(newPath);
      router.refresh();
    });
  };

  return (
    <button
      onClick={switchLocale}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-action transition-colors disabled:opacity-50"
      aria-label={`Switch to ${locale === 'ar' ? 'English' : 'Arabic'}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span className="uppercase">{locale === 'ar' ? 'EN' : 'AR'}</span>
    </button>
  );
}
