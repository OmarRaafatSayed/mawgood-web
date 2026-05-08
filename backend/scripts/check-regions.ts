/**
 * Check Regions and Countries
 */

import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function checkRegions({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info('=== Checking Regions ===')

  // Get all regions
  const { data: regions } = await query.graph({
    entity: 'region',
    fields: ['id', 'name', 'currency_code'],
    filters: {},
  })

  logger.info(`Total regions: ${regions.length}`)
  
  for (const region of regions) {
    logger.info(`\nRegion: ${region.name}`)
    logger.info(`  ID: ${region.id}`)
    logger.info(`  Currency: ${region.currency_code}`)
    
    // Get countries for this region
    const { data: countries } = await query.graph({
      entity: 'country',
      fields: ['id', 'name', 'iso_2', 'region_id'],
      filters: { region_id: region.id },
    })
    
    logger.info(`  Countries: ${countries.length}`)
    countries.forEach((country: any) => {
      logger.info(`    - ${country.name} (${country.iso_2})`)
    })
  }

  logger.info('\n=== Check Complete ===')
}
