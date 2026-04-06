import { Card } from "@/components/atoms"
import { getTranslations } from "next-intl/server"

export const OrderTrack = async ({ order }: { order: any }) => {
  const t = await getTranslations('orders')

  if (!order.fulfillments[0]?.labels?.length) return null

  const labels = order.fulfillments[0]?.labels

  return (
    <div>
      <h2 className="text-primary label-lg uppercase">{t('trackShipment')}</h2>
      <ul className="mt-4">
        {labels.map((item: any) => (
          <li key={item.id}>
            <a href={item.tracking_number} target="_blank">
              <Card className="px-4 hover:bg-secondary/30">{item.tracking_number}</Card>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
