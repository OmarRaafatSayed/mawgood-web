import { defineMiddlewares } from '@medusajs/framework/http'
import type { MiddlewaresConfig } from '@medusajs/framework/http'
import express from 'express'
import path from 'path'

export default defineMiddlewares({
  routes: [
    {
      matcher: '/static*',
      middlewares: [
        (req, res, next) => {
          // Serve static files from the static directory
          const staticPath = path.join(__dirname, '..', '..', 'static')
          express.static(staticPath)(req, res, next)
        }
      ]
    }
  ]
})
