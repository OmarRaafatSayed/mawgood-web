import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/**
 * Auto-link new products to the default sales channel.
 */
export default async function autoSetupProductSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const productModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

  try {
    const salesChannels = await salesChannelModuleService.listSalesChannels({}, { take: 1 })

    if (!salesChannels || salesChannels.length === 0) {
      console.log("[auto-setup-product] No sales channels found, skipping")
      return
    }

    const channelId = salesChannels[0].id
    const productId = data.id

    await salesChannelModuleService.updateSalesChannels(channelId, {
      products: [{ id: productId }],
    })

    console.log(`[auto-setup-product] Linked product ${productId} to sales channel ${channelId}`)
  } catch (error) {
    console.error("[auto-setup-product] Error:", error.message)
  }
}

export const config: SubscriberConfig = {
  event: "product.created",
}
