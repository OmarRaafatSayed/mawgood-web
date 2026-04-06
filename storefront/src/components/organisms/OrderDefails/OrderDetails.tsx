import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { format } from "date-fns"
import { getTranslations } from "next-intl/server"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = async ({ order, showStatus }: OrderDetailsProps) => {
  const t = await getTranslations('orders')

  return (
    <div className="border rounded-sm p-4 bg-ui-bg-subtle grid lg:grid-cols-2">
      <Text className="mt-2">
        <span className="font-bold block">{t('orderItems')}</span>
        <span>{format(order.created_at, "dd-MM-yyyy")}</span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        <span className="font-bold block">{t('orderSummary')}</span> #
        <span>{order.display_id}</span>
      </Text>
      {showStatus && (
        <div className="lg:col-span-2 flex items-center text-compact-small gap-x-4 mt-4">
          <>
            <Text>{t('orderItems')}</Text>
            <Text>{t('paymentMethod')}</Text>
          </>
        </div>
      )}
    </div>
  )
}

export default OrderDetails
