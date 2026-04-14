"use client"

import Image from "next/image"
import { useLocale } from "next-intl"
import { usePathname, useRouter, useParams } from "next/navigation"
import { useTransition, useState, useRef, useEffect, useCallback, useMemo } from "react"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { Badge } from "@/components/atoms"
import { SearchIcon, CartIcon, CollapseIcon, HamburgerMenuIcon, CloseIcon, ProfileIcon, VTonIcon } from "@/icons"
import { useTranslations } from "next-intl"
import { useCartContext } from "@/components/providers"
import { HttpTypes } from "@medusajs/types"
import { cn } from "@/lib/utils"
import { VTonDialog } from "@/components/molecules"

interface TopNavbarProps {
  isLoggedIn: boolean
  wishlistCount?: number
  categories?: HttpTypes.StoreProductCategory[]
  parentCategories?: HttpTypes.StoreProductCategory[]
}

export const TopNavbar = ({
  isLoggedIn,
  wishlistCount = 0,
  categories = [],
  parentCategories = [],
}: TopNavbarProps) => {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")
  const [showAllDropdown, setShowAllDropdown] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [vtonOpen, setVtonOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const t = useTranslations("common")
  const tNav = useTranslations("navbar")
  const tVton = useTranslations("vton")

  const { cart } = useCartContext()
  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAllDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  const switchLocale = useCallback(() => {
    const newLocale = locale === "ar" ? "en" : "ar"
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
    const currentPath = pathname.replace(/^\/(ar|en)/, "")
    const newPath = `/${newLocale}${currentPath || ""}`
    startTransition(() => {
      router.push(newPath)
      router.refresh()
    })
  }, [locale, pathname, router])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const query = encodeURIComponent(searchQuery.trim())
      if (selectedCategory !== "all") {
        router.push(`/categories?query=${query}&category=${selectedCategory}`)
      } else {
        router.push(`/categories?query=${query}`)
      }
    }
  }, [searchQuery, selectedCategory, router])

  const handleCategorySelect = (handle: string) => {
    setSelectedCategory(handle)
    setShowAllDropdown(false)
  }

  // Only used for chevron rotation - CSS handles all layout/direction
  const chevronDir = locale === "ar" ? "rotate-90" : "-rotate-90"

  return (
    <>
      <header className="bg-[#131921] text-white overflow-hidden">
        {/* Mobile header row */}
        <div className="flex items-center gap-2 px-3 py-2 sm:hidden mobile-header max-w-screen-lg mx-auto">
          {/* Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex-shrink-0 p-1"
            aria-label="Menu"
          >
            <HamburgerMenuIcon size={24} color="#fff" />
          </button>

          {/* Logo */}
          <LocalizedClientLink
            href="/"
            className="flex-shrink-0 flex items-center"
            aria-label={t("home")}
          >
            <Image
              src="/logo.svg"
              width={100}
              height={32}
              alt="Logo"
              priority
              className="h-7 w-auto"
            />
          </LocalizedClientLink>

          {/* Mobile Icons: Search + Cart */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="p-1"
              aria-label={t("search")}
            >
              <SearchIcon size={24} color="#fff" />
            </button>

            <LocalizedClientLink
              href="/cart"
              className="relative p-1"
            >
              <CartIcon size={24} color="#fff" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -end-1 w-4 h-4 p-0 bg-[#f08804] border-0 text-white text-[10px] flex items-center justify-center font-bold">
                  {cartCount}
                </Badge>
              )}
            </LocalizedClientLink>
          </div>
        </div>

        {/* Desktop header row */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 max-w-[1500px] mx-auto">
          {/* Logo */}
          <LocalizedClientLink
            href="/"
            className="flex-shrink-0 flex items-center"
            aria-label={t("home")}
          >
            <Image
              src="/logo.svg"
              width={100}
              height={32}
              alt="Logo"
              priority
              className="h-8 w-auto"
            />
          </LocalizedClientLink>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="flex-1 flex min-w-0">
            {/* Category Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowAllDropdown(!showAllDropdown)}
                className="flex items-center gap-1 px-2 bg-[#e6e6e6] hover:bg-[#d4d4d4] text-gray-700 rounded-s-md h-10 text-sm"
              >
                <span className="truncate max-w-[80px]">
                  {selectedCategory === "all"
                    ? tNav("all")
                    : parentCategories.find((p) => p.handle === selectedCategory)?.name ||
                      categories.find((c) => c.handle === selectedCategory)?.name ||
                      tNav("all")}
                </span>
                <CollapseIcon size={12} className={chevronDir} />
              </button>

              {showAllDropdown && (
                <div className="absolute top-full start-0 z-50 bg-white text-gray-900 shadow-lg rounded-b-md min-w-[200px] max-h-[300px] overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("all")}
                    className={`w-full text-start px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedCategory === "all" ? "bg-gray-100 font-semibold" : ""
                    }`}
                  >
                    {tNav("all")}
                  </button>
                  {parentCategories.map((parent) => (
                    <button
                      key={parent.id}
                      type="button"
                      onClick={() => handleCategorySelect(parent.handle!)}
                      className={`w-full text-start px-4 py-2 text-sm hover:bg-gray-100 ${
                        selectedCategory === parent.handle ? "bg-gray-100 font-semibold" : ""
                      }`}
                    >
                      {parent.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search")}
                className="w-full h-10 px-3 text-gray-900 focus:outline-none"
                aria-label={t("search")}
                dir="auto"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="bg-[#febd69] hover:bg-[#f3a847] px-4 rounded-e-md flex items-center justify-center"
              aria-label={t("search")}
            >
              <SearchIcon size={20} color="#111" />
            </button>
          </form>

          {/* Desktop Right Section */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Virtual Try-On */}
            <button
              onClick={() => setVtonOpen(true)}
              className="flex flex-col items-center justify-center hover:outline outline-1 outline-white p-1"
              aria-label={tVton("buttonText")}
            >
              <VTonIcon size={24} color="#fff" />
              <span className="text-xs">{tVton("buttonText")}</span>
            </button>

            {/* Language */}
            <button
              onClick={switchLocale}
              disabled={isPending}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              aria-label={`Switch to ${locale === "ar" ? "English" : "Arabic"}`}
            >
              <Image
                src={locale === "ar" ? "/flags/egypt.svg" : "/flags/us.svg"}
                width={24}
                height={16}
                alt={locale === "ar" ? "Arabic" : "English"}
              />
              <span className="text-xs uppercase">
                {locale === "ar" ? "AR" : "EN"}
              </span>
            </button>

            {/* Account */}
            <div className="relative group">
              <LocalizedClientLink
                href={isLoggedIn ? "/user" : "/login"}
                className="flex flex-col leading-tight hover:outline outline-1 outline-white p-1"
              >
                <span className="text-xs">
                  {isLoggedIn ? tNav("hello") : tNav("helloSignin")}
                </span>
                <span className="text-sm font-bold">{tNav("accountLists")}</span>
              </LocalizedClientLink>

              <div className="absolute top-full end-0 z-50 hidden group-hover:block bg-white text-gray-900 shadow-lg rounded-md min-w-[200px]">
                <div className="p-3">
                  {isLoggedIn ? (
                    <>
                      <LocalizedClientLink href="/user" className="block px-3 py-2 text-sm font-semibold hover:bg-gray-100 rounded">{tNav("yourAccount")}</LocalizedClientLink>
                      <LocalizedClientLink href="/user/orders" className="block px-3 py-2 text-sm hover:bg-gray-100 rounded">{t("orders")}</LocalizedClientLink>
                      <LocalizedClientLink href="/user/wishlist" className="block px-3 py-2 text-sm hover:bg-gray-100 rounded">{t("wishlist")}</LocalizedClientLink>
                      <LocalizedClientLink href="/user/settings" className="block px-3 py-2 text-sm hover:bg-gray-100 rounded">{t("settings")}</LocalizedClientLink>
                      <LocalizedClientLink href="/logout" className="block px-3 py-2 text-sm hover:bg-gray-100 rounded border-t">{t("logout")}</LocalizedClientLink>
                    </>
                  ) : (
                    <>
                      <LocalizedClientLink href="/login" className="block px-3 py-2 text-sm font-semibold hover:bg-gray-100 rounded">{t("login")}</LocalizedClientLink>
                      <LocalizedClientLink href="/register" className="block px-3 py-2 text-sm hover:bg-gray-100 rounded">{t("register")}</LocalizedClientLink>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Wishlist */}
            {isLoggedIn && (
              <LocalizedClientLink
                href="/user/wishlist"
                className="relative flex flex-col items-center justify-center hover:outline outline-1 outline-white p-1"
              >
                <span className="text-xs">{tNav("wishlist")}</span>
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -end-1 w-4 h-4 p-0 bg-[#f08804] border-0">
                    {wishlistCount}
                  </Badge>
                )}
              </LocalizedClientLink>
            )}

            {/* Cart */}
            <LocalizedClientLink
              href="/cart"
              className="relative flex items-center gap-1 hover:outline outline-1 outline-white p-1"
            >
              <div className="relative">
                <CartIcon size={28} color="#fff" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -end-1 w-5 h-5 p-0 bg-[#f08804] border-0 text-white text-xs flex items-center justify-center font-bold">
                    {cartCount}
                  </Badge>
                )}
              </div>
              <span className="text-sm font-bold">{t("cart")}</span>
            </LocalizedClientLink>
          </div>
        </div>

        {/* Mobile Search (expandable) */}
        {mobileSearchOpen && (
          <div className="sm:hidden bg-[#131921] px-3 pb-2 max-w-screen-lg mx-auto">
            <form onSubmit={handleSearch} className="flex">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search")}
                  className="w-full h-10 px-3 pe-10 text-gray-900 rounded-s-md focus:outline-none"
                  aria-label={t("search")}
                  dir="auto"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => { setMobileSearchOpen(false); setSearchQuery("") }}
                  className="absolute end-2 top-1/2 -translate-y-1/2 p-1"
                >
                  <CloseIcon size={16} color="#666" />
                </button>
              </div>
              <button
                type="submit"
                className="bg-[#febd69] hover:bg-[#f3a847] px-4 rounded-e-md flex items-center justify-center"
                aria-label={t("search")}
              >
                <SearchIcon size={20} color="#111" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Desktop Category Navbar */}
      <div className="hidden lg:block">
        <CategoryNavbarDesktop
          categories={categories}
          parentCategories={parentCategories}
        />
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="fixed top-0 z-50 h-full w-[85%] max-w-sm bg-white shadow-xl overflow-y-auto lg:hidden start-0"
          >
            <div className="flex items-center justify-between border-b p-4 sticky top-0 z-10 bg-white">
              <h2 className="heading-md text-gray-900">{t("categories")}</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1" aria-label={t("close")}>
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="p-4">
              <LocalizedClientLink
                href="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-base font-semibold text-[#f08804] border-b border-gray-200"
              >
                {t("viewAll")}
              </LocalizedClientLink>

              {parentCategories.map((parent) => (
                <MobileCategoryItem
                  key={parent.id}
                  category={parent}
                  allCategories={categories}
                  onClose={() => setMobileMenuOpen(false)}
                />
              ))}

              {/* Drawer Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <LocalizedClientLink
                  href={isLoggedIn ? "/user" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 text-sm text-gray-700 hover:text-[#f08804]"
                >
                  <ProfileIcon size={20} />
                  <span>{isLoggedIn ? tNav("yourAccount") : tNav("helloSignin")}</span>
                </LocalizedClientLink>
                {isLoggedIn && (
                  <>
                    <LocalizedClientLink href="/user/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 text-sm text-gray-700 hover:text-[#f08804]">
                      <span>{t("orders")}</span>
                    </LocalizedClientLink>
                    <LocalizedClientLink href="/user/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#f08804]">
                      <span>{t("wishlist")}</span>
                    </LocalizedClientLink>
                  </>
                )}
                <button
                  onClick={() => { switchLocale(); setMobileMenuOpen(false) }}
                  className="flex items-center gap-3 py-3 text-sm text-gray-700 hover:text-[#f08804] w-full text-start"
                >
                  <Image
                    src={locale === "ar" ? "/flags/egypt.svg" : "/flags/us.svg"}
                    width={24}
                    height={16}
                    alt={locale === "ar" ? "Arabic" : "English"}
                  />
                  <span>{locale === "ar" ? "العربية" : "English"}</span>
                </button>

                {/* Mobile VTon Button */}
                <button
                  onClick={() => { setVtonOpen(true); setMobileMenuOpen(false) }}
                  className="flex items-center gap-3 py-3 text-sm text-gray-700 hover:text-[#f08804] w-full text-start"
                >
                  <VTonIcon size={20} color="#374151" />
                  <span>{tVton("buttonText")}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Virtual Try-On Dialog */}
      <VTonDialog isOpen={vtonOpen} onClose={() => setVtonOpen(false)} />
    </>
  )
}

/* Mobile Category Item */
function MobileCategoryItem({
  category,
  allCategories,
  onClose,
}: {
  category: HttpTypes.StoreProductCategory
  allCategories: HttpTypes.StoreProductCategory[]
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const children = allCategories.filter(
    (c) => c.parent_category_id === category.id
  )

  const hasChildren = children.length > 0

  return (
    <div className="border-b border-gray-100">
      <div className="flex items-center justify-between py-3">
        <LocalizedClientLink
          href={`/categories/${category.handle}`}
          onClick={onClose}
          className="flex-1 text-sm text-gray-700 hover:text-[#f08804]"
        >
          {category.name}
        </LocalizedClientLink>
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <CollapseIcon
              size={16}
              className={`transition-transform duration-200 ${
                expanded ? "" : "rotate-90"
              }`}
            />
          </button>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="pb-2 ps-4">
          {children.map((child) => (
            <LocalizedClientLink
              key={child.id}
              href={`/categories/${child.handle}`}
              onClick={onClose}
              className="block py-2 text-sm text-gray-500 hover:text-[#f08804]"
            >
              {child.name}
            </LocalizedClientLink>
          ))}
        </div>
      )}
    </div>
  )
}

/* Desktop Category Navbar */
function CategoryNavbarDesktop({
  categories,
  parentCategories,
}: {
  categories: HttpTypes.StoreProductCategory[]
  parentCategories: HttpTypes.StoreProductCategory[]
}) {
  const t = useTranslations("common")
  const params = useParams<{ category?: string }>()
  const { category } = params

  const activeHandle = useMemo(() => {
    if (!category) return null
    const parent = parentCategories.find((p) => p.handle === category)
    if (parent) return category
    const child = categories.find((c) => c.handle === category)
    if (child && child.parent_category_id) {
      const parent = parentCategories.find((p) => p.id === child.parent_category_id)
      return parent?.handle || null
    }
    return category
  }, [category, categories, parentCategories])

  return (
    <nav className="bg-white border-b border-gray-200" aria-label="Category navigation">
      <div className="max-w-[1500px] mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
          <LocalizedClientLink
            href="/categories"
            className={cn(
              "px-3 py-1 text-sm whitespace-nowrap text-gray-700 hover:text-[#c7511f] hover:underline transition-colors",
              (!category || category === "all") && "text-[#c7511f] font-semibold"
            )}
          >
            {t("viewAll")}
          </LocalizedClientLink>

          {parentCategories.map(({ id, handle, name }) => {
            const isActive = handle === activeHandle
            return (
              <LocalizedClientLink
                key={id}
                href={`/categories/${handle}`}
                className={cn(
                  "px-3 py-1 text-sm whitespace-nowrap text-gray-700 hover:text-[#c7511f] hover:underline transition-colors",
                  isActive && "text-[#c7511f] font-semibold border-b-2 border-[#c7511f]"
                )}
              >
                {name}
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
