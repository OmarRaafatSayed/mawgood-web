'use client';

import { useTranslations } from 'next-intl';

const ProductListingNoResultsView = () => {
  const t = useTranslations('filters');

  return (
    <div className="text-center w-full my-10" data-testid="product-listing-no-results-view">
      <h2 className="uppercase text-primary heading-lg">{t('noResults')}</h2>
      <p className="mt-4 text-lg">{t('tryDifferentFilters')}</p>
    </div>
  );
};

export default ProductListingNoResultsView;
