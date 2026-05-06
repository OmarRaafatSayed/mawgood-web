import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function getRegions({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  const result = await query.graph({
    entity: 'region',
    fields: ['id', 'name', 'currency_code', 'countries'],
    filters: {}
  })

  console.log('Regions:', JSON.stringify(result.data, null, 2))
}
