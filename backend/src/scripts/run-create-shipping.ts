import { MedusaAppLoader } from '@medusajs/framework'
import { createDefaultStoreShipping } from './create-default-shipping'

async function run() {
  const { container } = await MedusaAppLoader.load()
  
  try {
    await createDefaultStoreShipping(container)
    console.log('✅ Done!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

run()
