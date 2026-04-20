import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

export default async function debugProducts({ container }: ExecArgs) {
  const apiKeyService = container.resolve(Modules.API_KEY)
  const productService = container.resolve(Modules.PRODUCT)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const query = container.resolve('query')

  // Get API keys
  const apiKeys = await apiKeyService.listApiKeys({ type: 'publishable' })
  console.log('=== API Keys ===')
  apiKeys.forEach(k => console.log(`Key: ${k.token}, ID: ${k.id}`))

  // Get linked sales channels
  for (const key of apiKeys) {
    const result = await query.graph({
      entity: 'api_key',
      fields: ['*', 'sales_channels.id', 'sales_channels.name'],
      filters: { id: key.id }
    })
    console.log(`\nSales channels linked to key ${key.id}:`)
    console.log(JSON.stringify(result.data[0]?.sales_channels || [], null, 2))
  }

  // Get all products count
  const allProducts = await productService.listProducts({})
  console.log(`\n=== Total products in DB: ${allProducts.length} ===`)

  // Get all sales channels
  const salesChannels = await salesChannelService.listSalesChannels({})
  console.log(`\n=== Sales Channels ===`)
  salesChannels.forEach(sc => console.log(`ID: ${sc.id}, Name: ${sc.name}`))

  // Check products with sales channels
  const productsWithSC = await productService.listProducts({
    relations: ['sales_channels']
  })
  console.log(`\n=== Products with Sales Channels ===`)
  productsWithSC.forEach(p => {
    console.log(`Product: ${p.title}, Sales Channels: ${p.sales_channels?.map(sc => sc.name).join(', ') || 'NONE'}`)
  })
}
