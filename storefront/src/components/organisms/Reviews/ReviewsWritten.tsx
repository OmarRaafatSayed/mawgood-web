"use client"
import { Card, NavigationItem } from "@/components/atoms"
import { Order, Review } from "@/lib/data/reviews"
import { isEmpty } from "lodash"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { OrderCard } from "./OrderCard"
import { RefreshButton } from "@/components/cells/RefreshButton/RefreshButton"

export const ReviewsWritten = ({
  reviews,
  orders,
  isError,
}: {
  reviews: Review[]
  orders: Order[]
  isError: boolean
}) => {
  const pathname = usePathname()
  const t = useTranslations('reviews')
  const tErrors = useTranslations('errors')

  const navigation = [
    { label: t('writeReview'), href: '/user/reviews' },
    { label: t('myReviews'), href: '/user/reviews/written' },
  ]

  function renderReviews() {
    if (isError) {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-negative">{tErrors('somethingWentWrong')}</p>
          <RefreshButton label={t('myReviews')} />
        </div>
      )
    }

    if (isEmpty(reviews)) {
      return (
        <Card>
          <div className="text-center py-6">
            <h3 className="heading-lg text-primary uppercase">{t('myReviews')}</h3>
            <p className="text-lg text-secondary mt-2">{t('verifiedPurchase')}</p>
          </div>
        </Card>
      )
    }

    return (
      <div className="space-y-2">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    )
  }

  return (
    <div className="md:col-span-3 space-y-8">
      <h1 className="heading-md uppercase">{t('myReviews')}</h1>
      <div className="flex gap-4">
        {navigation.map((item) => (
          <NavigationItem key={item.label} href={item.href} active={pathname === item.href} className="px-0">
            {item.label}
          </NavigationItem>
        ))}
      </div>
      {renderReviews()}
    </div>
  )
}
