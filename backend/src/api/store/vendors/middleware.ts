import { MiddlewareRoute } from '@medusajs/framework'

export const storeMiddlewareRoutes: MiddlewareRoute[] = [
  {
    method: ['GET'],
    matcher: '/store/vendors*',
    middlewares: [
      // Add any custom middleware here if needed
    ]
  },
  {
    method: ['GET'],
    matcher: '/store/vendors/:id/products',
    middlewares: [
      // Vendor-specific product access control
    ]
  }
]
