'use client';

import { useEffect, useState } from 'react';

import { HttpTypes } from '@medusajs/types';

import { IconButton } from '@/components/atoms';
import { HeaderCategoryNavbar } from '@/components/molecules';
import { CloseIcon, HamburgerMenuIcon } from '@/icons';
import { useTranslations } from 'next-intl';

import { MobileCategoryNavbar } from './components';

interface MobileNavbarProps {
  categories: HttpTypes.StoreProductCategory[]
  parentCategories: HttpTypes.StoreProductCategory[]
}

export const MobileNavbar = ({
  categories,
  parentCategories
}: {
  categories: HttpTypes.StoreProductCategory[];
  parentCategories: HttpTypes.StoreProductCategory[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('common')

  const closeMenuHandler = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div
      className="lg:hidden"
      data-testid="mobile-navbar"
    >
      <div
        onClick={() => setIsOpen(true)}
        data-testid="mobile-menu-toggle"
      >
        <HamburgerMenuIcon />
      </div>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeMenuHandler}
            data-testid="mobile-menu-overlay"
          />
          <div
            className="fixed start-0 top-0 z-50 h-full w-[85%] max-w-sm bg-primary shadow-xl overflow-y-auto"
            data-testid="mobile-menu-drawer"
          >
            <div
              className="flex items-center justify-between border-b p-4 bg-primary sticky top-0 z-10"
              data-testid="mobile-menu-header"
            >
              <h2 className="heading-md uppercase text-primary">{t('categories')}</h2>
              <IconButton
                icon={<CloseIcon size={20} />}
                onClick={() => closeMenuHandler()}
                variant="icon"
                size="small"
                data-testid="mobile-menu-close-button"
              />
            </div>
            <div className="">
              <HeaderCategoryNavbar
                onClose={closeMenuHandler}
                categories={categories}
                parentCategories={parentCategories}
              />
              <div className="p-4">
                <MobileCategoryNavbar
                  onClose={closeMenuHandler}
                  categories={categories}
                  parentCategories={parentCategories}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
