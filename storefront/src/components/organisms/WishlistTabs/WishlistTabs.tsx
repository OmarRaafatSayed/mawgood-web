import { TabsContent, TabsList } from "@/components/molecules"
import { Suspense } from "react"
import { ProductsPagination } from "../ProductsPagination/ProductsPagination"
import { getTranslations } from "next-intl/server"

export const WishlistTabs = async ({ tab }: { tab: string }) => {
  const t = await getTranslations('common')

  const wishlistTabs = [
    { label: t('viewAll'), link: "/wishlist" },
    { label: t('products'), link: "/wishlist/products" },
  ]

  return (
    <div>
      <TabsList list={wishlistTabs} activeTab={tab} />
      <TabsContent value="all" activeTab={tab}>
        <Suspense fallback={<>{t('loading')}</>}>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 mt-8" />
          <ProductsPagination pages={2} />
        </Suspense>
      </TabsContent>
      <TabsContent value="products" activeTab={tab}>
        <Suspense fallback={<>{t('loading')}</>}>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 mt-8" />
          <ProductsPagination pages={2} />
        </Suspense>
      </TabsContent>
    </div>
  )
}
