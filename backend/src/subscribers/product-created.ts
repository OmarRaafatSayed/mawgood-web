import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { SELLER_MODULE } from "@mercurjs/b2c-core/modules/seller"

export default async function productCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const productService = container.resolve(Modules.PRODUCT)
  const sellerService = container.resolve(SELLER_MODULE)
  const query = container.resolve("query")

  // Get the product
  const product = await productService.retrieveProduct(data.id)

  // If product already has a seller, skip
  if (product.seller_id) {
    return
  }

  // Get the first seller (default seller)
  const { data: sellers } = await query.graph({
    entity: "seller",
    fields: ["id", "name"],
    pagination: { take: 1 }
  })

  if (!sellers || sellers.length === 0) {
    console.log("No seller found to assign to product")
    return
  }

  const defaultSeller = sellers[0]

  // Assign the default seller to the product
  await productService.updateProducts([
    {
      id: product.id,
      seller_id: defaultSeller.id
    }
  ])

  console.log(`✅ Product ${product.id} assigned to seller ${defaultSeller.name}`)
}

export const config: SubscriberConfig = {
  event: "product.created",
}
