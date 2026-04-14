import { createFileRoute } from '@tanstack/react-router'
import { FeaturedCategories } from './featured-categories'

export const Route = createFileRoute('/settings/featured-categories/')({
  component: FeaturedCategories,
})
