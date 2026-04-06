import { WishlistTabs } from '@/components/organisms'
import { HomeCategories } from '../HomeCategories/HomeCategories'
import { getTranslations } from 'next-intl/server'

export const WishlistPage = async ({ tab }: { tab: string }) => {
  const t = await getTranslations('common')

  return (
    <>
      <WishlistTabs tab={tab} />
      <HomeCategories heading={t('continueShopping')} />
    </>
  )
}
