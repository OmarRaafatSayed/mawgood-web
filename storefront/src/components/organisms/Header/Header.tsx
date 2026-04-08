import { HttpTypes } from "@medusajs/types"

import { TopNavbar } from "./TopNavbar"
import { listCategories } from "@/lib/data/categories"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { Wishlist } from "@/types/wishlist"

export const Header = async ({ locale }: {
  locale: string
}) => {
  const user = await retrieveCustomer().catch(() => null)
  const isLoggedIn = Boolean(user)

  let wishlist: Wishlist = { products: [] }
  if (user) {
    wishlist = await getUserWishlists({ countryCode: locale })
  }

  const wishlistCount = wishlist?.products.length || 0

  const { categories, parentCategories } = (await listCategories({ query: { include_ancestors_tree: true } })) as {
    categories: HttpTypes.StoreProductCategory[]
    parentCategories: HttpTypes.StoreProductCategory[]
  }

  return (
    <TopNavbar
      isLoggedIn={isLoggedIn}
      wishlistCount={wishlistCount}
      categories={categories}
      parentCategories={parentCategories}
    />
  )
}
