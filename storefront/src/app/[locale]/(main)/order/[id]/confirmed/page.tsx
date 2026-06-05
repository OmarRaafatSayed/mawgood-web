import { OrderConfirmedSection } from '@/components/sections/OrderConfirmedSection/OrderConfirmedSection'
import { retrieveOrder } from '@/lib/data/orders'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Your purchase was successful'
}

export default async function OrderConfirmedPage(props: Props) {
  const params = await props.params
  const orderId = params.id

  if (!orderId) {
    return notFound()
  }

  let order = null
  try {
    order = await retrieveOrder(orderId)
  } catch (err) {
    console.error('[OrderConfirmedPage] Failed to retrieve order:', orderId, err)
  }

  if (!order) {
    // Order fetch failed — show a confirmation page with just the order ID
    // so the customer knows the order was placed even if we can't load details
    return (
      <main className="container">
        <OrderConfirmedSection order={null} orderId={orderId} />
      </main>
    )
  }

  return (
    <main className="container">
      <OrderConfirmedSection order={order} orderId={orderId} />
    </main>
  )
}
