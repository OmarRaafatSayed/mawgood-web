'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export const ProductListingHeader = ({ total }: { total: number }) => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('filters');

  return (
    <div className="flex w-full items-center justify-between" data-testid="product-listing-header">
      <div data-testid="product-listing-total">{total} {t('showResults')}</div>
    </div>
  );
};
