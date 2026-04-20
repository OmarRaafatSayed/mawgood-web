import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

export default async function getApiKey({ container }: ExecArgs) {
  const apiKeyService = container.resolve(Modules.API_KEY)
  
  const keys = await apiKeyService.listApiKeys({ type: 'publishable' })
  
  if (keys.length > 0) {
    console.log('Publishable API Key:', keys[0].token)
  } else {
    console.log('No publishable key found')
  }
}
