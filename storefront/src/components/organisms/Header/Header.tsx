import Image from "next/image"
import { HttpTypes } from "@medusajs/types"

import { CartDropdown, MobileNavbar, Navbar } from "@/components/cells"
import { MobileTopBar } from "@/components/cells/MobileNavbar/components/MobileTopBar"
import { HeartIcon } from "@/icons"
import { UserDropdown } from "@/components/cells/UserDropdown/UserDropdown"
import { Wishlist } from "@/types/wishlist"
import { Badge, LanguageSwitcher } from "@/components/atoms"
import CountrySelector from "@/components/molecules/CountrySelector/CountrySelector"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { MessageButton } from "@/components/molecules/MessageButton/MessageButton"
import { listCategories } from "@/lib/data/categories"
import { listRegions } from "@/lib/data/regions"
import { getUserWishlists } from "@/lib/data/wishlist"
import { retrieveCustomer } from "@/lib/data/customer"
import { ParentCategoryLinks } from "@/components/molecules/ParentCategoryLinks/ParentCategoryLinks"

export const Header = async ({ locale } : {
  locale: string
}) => {
  const user = await retrieveCustomer().catch(() => null)
  const isLoggedIn = Boolean(user)

  let wishlist: Wishlist = {products: []}
  if (user) {
    wishlist = await getUserWishlists({countryCode: locale}).catch(() => ({products: []}))
  }

  const regions = await listRegions().catch(() => [])
  const wishlistCount = wishlist?.products.length || 0

  const { categories, parentCategories } = await listCategories({ query: { include_ancestors_tree: true } })
    .catch(() => ({ categories: [] as HttpTypes.StoreProductCategory[], parentCategories: [] as HttpTypes.StoreProductCategory[] }))

  return (
    <header data-testid="header">
      {/* Mobile Header - يستخدم MobileTopBar */}
      <MobileTopBar
        parentCategories={parentCategories}
        categories={categories}
        isLoggedIn={isLoggedIn}
        wishlist={wishlist}
      />

      {/* Desktop Header */}
      <div className="hidden lg:flex py-2 lg:px-8 px-4 md:px-5" data-testid="header-top">
        <div className="flex items-center lg:w-1/3">
          <ParentCategoryLinks
            parentCategories={parentCategories}
            categories={categories}
          />
        </div>
        <div className="flex lg:justify-center lg:w-1/3 items-center">
          <LocalizedClientLink href="/" className="text-2xl font-bold" data-testid="header-logo-link">
            <Image
              src="/logo.svg"
              width={126}
              height={40}
              alt="Logo"
              priority
            />
          </LocalizedClientLink>
        </div>
        <div className="flex items-center justify-end gap-2 lg:gap-4 w-full lg:w-1/3 py-2" data-testid="header-actions">
          <LanguageSwitcher />
          <CountrySelector regions={regions} />
          {isLoggedIn && <MessageButton />}
          <UserDropdown isLoggedIn={isLoggedIn} />
          {isLoggedIn && (
            <LocalizedClientLink href="/user/wishlist" className="relative" data-testid="header-wishlist-link">
              <HeartIcon size={20} />
              {Boolean(wishlistCount) && (
                <Badge className="absolute -top-2 -end-2 w-4 h-4 p-0" data-testid="wishlist-count-badge">
                  {wishlistCount}
                </Badge>
              )}
            </LocalizedClientLink>
          )}
          <CartDropdown />
        </div>
      </div>

      <Navbar categories={categories} parentCategories={parentCategories} />
    </header>
  )
}
