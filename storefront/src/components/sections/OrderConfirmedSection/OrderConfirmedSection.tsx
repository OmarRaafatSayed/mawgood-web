import { CheckCircleSolid } from '@medusajs/icons'
import { HttpTypes } from '@medusajs/types'
import { Heading, Text } from '@medusajs/ui'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { convertToLocale } from '@/lib/helpers/money'
import OrderItems from '../../organisms/OrderItems/OrderItems'

const ESTIMATED_DELIVERY_DAYS = 3

type Props = {
  order: HttpTypes.StoreOrder | null
  orderId: string
}

export const OrderConfirmedSection = async ({ order, orderId }: Props) => {
  const locale = await getLocale()
  const t = await getTranslations()
  const isAr = locale === 'ar'
  const dateLocale = isAr ? ar : enUS

  const estimatedDelivery = new Date(order?.created_at ?? Date.now())
  estimatedDelivery.setDate(estimatedDelivery.getDate() + ESTIMATED_DELIVERY_DAYS)

  const payment = order?.payment_collections?.[0]?.payments?.[0]
  const shippingMethod = order?.shipping_methods?.[0]

  const paymentLabel = payment?.provider_id?.includes('cash-on-delivery')
    ? t('common.cashOnDelivery')
    : payment?.provider_id ?? t('common.payment')

  return (
    <div className="py-10">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
            <CheckCircleSolid className="text-green-600 w-8 h-8" />
          </div>
          <Heading level="h1" className="text-3xl font-semibold text-ui-fg-base">
            {t('checkout.orderConfirmed')}
          </Heading>
          <Text className="text-ui-fg-subtle text-base max-w-md">
            {t('checkout.thankYou')}
            {order?.email && (
              <>
                {' '}
                <span className="font-semibold text-ui-fg-base" data-testid="order-email">
                  {order.email}
                </span>
              </>
            )}
          </Text>
        </div>

        {/* Order meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border rounded-sm p-5 bg-ui-bg-subtle">
          <div>
            <Text className="text-xs text-ui-fg-muted uppercase tracking-wide mb-1">
              {t('common.orderNumber')}
            </Text>
            <Text className="font-semibold text-ui-fg-base">
              {order ? `#${order.display_id}` : orderId}
            </Text>
          </div>
          <div>
            <Text className="text-xs text-ui-fg-muted uppercase tracking-wide mb-1">
              {t('common.orderDate')}
            </Text>
            <Text className="font-semibold text-ui-fg-base">
              {format(new Date(order?.created_at ?? Date.now()), 'dd MMM yyyy', { locale: dateLocale })}
            </Text>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Text className="text-xs text-ui-fg-muted uppercase tracking-wide mb-1">
              {t('checkout.estimatedDelivery')}
            </Text>
            <Text className="font-semibold text-green-600">
              {isAr
                ? `${ESTIMATED_DELIVERY_DAYS} أيام عمل`
                : `${ESTIMATED_DELIVERY_DAYS} business days`}
            </Text>
            <Text className="text-xs text-ui-fg-muted">
              {isAr ? 'بحلول' : 'By'}{' '}
              {format(estimatedDelivery, 'dd MMM yyyy', { locale: dateLocale })}
            </Text>
          </div>
        </div>

        {/* Items */}
        {order?.items && order.items.length > 0 && (
          <div className="border rounded-sm p-5">
            <Heading level="h2" className="text-lg font-semibold text-ui-fg-base mb-4">
              {t('orders.orderItems')}
            </Heading>
            <OrderItems order={order} />
          </div>
        )}

        {/* Shipping & payment */}
        {order && (
          <div className="border rounded-sm p-5 grid sm:grid-cols-2 gap-6">
            {order.shipping_address && (
              <div>
                <Text className="text-xs text-ui-fg-muted uppercase tracking-wide mb-2">
                  {t('common.shippingAddress')}
                </Text>
                <Text className="text-ui-fg-base font-medium">
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                </Text>
                <Text className="text-ui-fg-subtle text-sm">
                  {order.shipping_address.address_1}
                  {order.shipping_address.address_2 ? `, ${order.shipping_address.address_2}` : ''}
                </Text>
                <Text className="text-ui-fg-subtle text-sm">
                  {order.shipping_address.postal_code}, {order.shipping_address.city}
                </Text>
                <Text className="text-ui-fg-subtle text-sm">
                  {order.shipping_address.country_code?.toUpperCase()}
                </Text>
                {order.shipping_address.phone && (
                  <Text className="text-ui-fg-subtle text-sm mt-1">
                    {order.shipping_address.phone}
                  </Text>
                )}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {shippingMethod && (
                <div>
                  <Text className="text-xs text-ui-fg-muted uppercase tracking-wide mb-2">
                    {t('common.shippingMethod')}
                  </Text>
                  <Text className="text-ui-fg-base font-medium">{shippingMethod.name}</Text>
                  <Text className="text-ui-fg-subtle text-sm">
                    {convertToLocale({
                      amount: shippingMethod.total ?? 0,
                      currency_code: order.currency_code
                    })}
                  </Text>
                </div>
              )}
              {payment && (
                <div>
                  <Text className="text-xs text-ui-fg-muted uppercase tracking-wide mb-2">
                    {t('common.paymentMethod')}
                  </Text>
                  <Text className="text-ui-fg-base font-medium">{paymentLabel}</Text>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Totals */}
        {order && (
          <div className="border rounded-sm p-5 bg-ui-bg-subtle">
            <div className="flex flex-col gap-y-2 text-sm text-ui-fg-subtle">
              <div className="flex items-center justify-between">
                <span>{t('orders.itemsTotal')}</span>
                <span>
                  {convertToLocale({
                    amount: order.item_total ?? 0,
                    currency_code: order.currency_code
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('orders.shippingCost')}</span>
                <span>
                  {convertToLocale({
                    amount: order.shipping_total ?? 0,
                    currency_code: order.currency_code
                  })}
                </span>
              </div>
              {(order.discount_total ?? 0) > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span>{t('common.discount')}</span>
                  <span>
                    -{convertToLocale({
                      amount: order.discount_total ?? 0,
                      currency_code: order.currency_code
                    })}
                  </span>
                </div>
              )}
            </div>
            <div className="h-px w-full border-b border-gray-200 my-3" />
            <div className="flex items-center justify-between font-semibold text-ui-fg-base">
              <span>{t('orders.grandTotal')}</span>
              <span className="text-lg">
                {convertToLocale({
                  amount: order.total ?? 0,
                  currency_code: order.currency_code
                })}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/user/orders"
            className="flex-1 flex items-center justify-center px-6 py-3 rounded-sm border border-ui-border-base text-ui-fg-base font-medium hover:bg-ui-bg-subtle transition-colors"
          >
            {t('orders.myOrders')}
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center px-6 py-3 rounded-sm bg-ui-button-neutral text-ui-fg-on-color font-medium hover:bg-ui-button-neutral-hover transition-colors"
          >
            {t('common.continueShopping')}
          </Link>
        </div>

      </div>
    </div>
  )
}
