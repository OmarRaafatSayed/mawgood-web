import { defineMiddlewares } from '@medusajs/framework/utils'
import { isVendor, isAdmin } from './middlewares/vendor-auth'

export default defineMiddlewares({
  routes: [
    {
      matcher: '/admin/vendors*',
      middlewares: [isAdmin]
    },
    {
      matcher: '/admin/vendors/:id*',
      middlewares: [isAdmin]
    },
    {
      matcher: '/vendor/products*',
      middlewares: [isVendor]
    },
    {
      matcher: '/vendor/orders*',
      middlewares: [isVendor]
    }
  ]
})
