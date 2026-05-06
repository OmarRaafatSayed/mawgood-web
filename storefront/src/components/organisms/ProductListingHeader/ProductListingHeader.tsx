'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FilterIcon } from '@/icons';
import { Drawer } from "@medusajs/ui"

export const ProductListingHeader = ({ total }: { total: number }) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="flex w-full items-center justify-between px-4 py-3 bg-white border-b border-gray-100 rounded-xl shadow-sm"
      data-testid="product-listing-header"
    >
      <div className="font-bold text-secondary-900" data-testid="product-listing-total">
        {total} <span className="font-medium text-gray-500 text-sm">منتج</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Drawer>
          <Drawer.Trigger asChild>
            <button className="md:hidden flex items-center gap-2 px-4 py-2 bg-brand-400 text-white rounded-lg hover:bg-brand-500 transition-all active:scale-95 shadow-md shadow-brand-400/20">
              <FilterIcon className="w-4 h-4" />
              <span className="text-sm font-bold">تصفية</span>
            </button>
          </Drawer.Trigger>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title className="text-right">تصفية المنتجات</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body className="p-4">
              <p className="text-gray-500 text-center py-10 font-medium">قائمة الفلاتر ستظهر هنا</p>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      </div>
    </div>
  );
};
