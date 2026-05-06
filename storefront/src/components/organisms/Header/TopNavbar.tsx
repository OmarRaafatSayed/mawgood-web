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
      <header className="bg-[#0e111a] text-white overflow-hidden border-b border-white/5">
        {/* Mobile header row */}
        <div className="flex items-center gap-4 px-4 py-3 sm:hidden mobile-header max-w-screen-lg mx-auto">
          {/* Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
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
              width={120}
              height={40}
              alt="Logo"
              priority
              className="h-8 w-auto brightness-100"
            />
          </LocalizedClientLink>

          {/* Mobile Icons: Search + Cart */}
          <div className="flex items-center gap-3 ms-auto">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white"
              aria-label={t("search")}
            >
              <SearchIcon size={24} color="#fff" />
            </button>

            <LocalizedClientLink
              href="/cart"
              className="relative p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <CartIcon size={24} color="#F26318" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -end-1 w-5 h-5 p-0 bg-brand-400 border-2 border-[#0e111a] text-white text-[10px] flex items-center justify-center font-black rounded-full">
                  {cartCount}
                </Badge>
              )}
            </LocalizedClientLink>
          </div>
        </div>

        {/* Desktop header row */}
        <div className="hidden sm:flex items-center gap-6 px-6 py-3 max-w-[1600px] mx-auto">
          {/* Logo */}
          <LocalizedClientLink
            href="/"
            className="flex-shrink-0 flex items-center group transition-transform active:scale-95"
            aria-label={t("home")}
          >
            <Image
              src="/logo.svg"
              width={140}
              height={45}
              alt="Logo"
              priority
              className="h-10 w-auto brightness-100 contrast-125"
            />
          </LocalizedClientLink>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="flex-1 flex min-w-0 group/search shadow-lg">
            {/* Category Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowAllDropdown(!showAllDropdown)}
                className="flex items-center gap-2 px-4 bg-white/95 hover:bg-white text-secondary-900 rounded-s-xl h-12 text-sm font-bold transition-all border-y border-s border-transparent"
              >
                <span className="truncate max-w-[100px]">
                  {selectedCategory === "all"
                    ? tNav("all")
                    : parentCategories.find((p) => p.handle === selectedCategory)?.name ||
                      categories.find((c) => c.handle === selectedCategory)?.name ||
                      tNav("all")}
                </span>
                <CollapseIcon size={14} className={`${chevronDir} opacity-60`} />
              </button>

              {showAllDropdown && (
                <div className="absolute top-full start-0 z-50 bg-white text-gray-900 shadow-2xl rounded-b-xl min-w-[240px] max-h-[450px] overflow-y-auto py-3 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("all")}
                    className={`w-full text-start px-5 py-3 text-sm hover:bg-brand-50 hover:text-brand-600 transition-colors ${
                      selectedCategory === "all" ? "bg-brand-50 text-brand-600 font-bold" : "font-medium"
                    }`}
                  >
                    {tNav("all")}
                  </button>
                  {parentCategories.map((parent) => (
                    <button
                      key={parent.id}
                      type="button"
                      onClick={() => handleCategorySelect(parent.handle!)}
                      className={`w-full text-start px-5 py-3 text-sm hover:bg-brand-50 hover:text-brand-600 transition-colors ${
                        selectedCategory === parent.handle ? "bg-brand-50 text-brand-600 font-bold" : "font-medium"
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
                className="w-full h-12 px-5 text-gray-900 focus:outline-none bg-white font-medium text-base placeholder:text-gray-400"
                aria-label={t("search")}
                dir="auto"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="bg-brand-400 hover:bg-brand-500 px-7 rounded-e-xl flex items-center justify-center transition-all group-focus-within/search:ring-2 ring-brand-400/50 active:scale-95"
              aria-label={t("search")}
            >
              <SearchIcon size={24} color="#fff" className="group-hover:scale-110 transition-transform" />
            </button>
          </form>

          {/* Desktop Right Section */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Virtual Try-On */}
            <button
              onClick={() => setVtonOpen(true)}
              className="flex flex-col items-center justify-center hover:bg-white/10 rounded-xl px-4 py-2 transition-all group"
            >
              <VTonIcon size={26} color="#fff" className="group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold mt-1 text-white tracking-wide uppercase">{tVton("buttonText")}</span>
            </button>

            {/* Language */}
            <button
              onClick={switchLocale}
              disabled={isPending}
              className="flex items-center gap-2.5 hover:bg-white/10 rounded-xl px-4 py-2 transition-all text-white"
            >
              <Image
                src={locale === "ar" ? "/flags/egypt.svg" : "/flags/us.svg"}
                width={24}
                height={18}
                alt={locale === "ar" ? "Arabic" : "English"}
                className="rounded shadow-sm"
              />
              <span className="text-sm font-black uppercase tracking-wider">
                {locale === "ar" ? "AR" : "EN"}
              </span>
            </button>

            {/* Account */}
            <div className="relative group/account">
              <LocalizedClientLink
                href={isLoggedIn ? "/user" : "/login"}
                className="flex flex-col leading-tight hover:bg-white/10 rounded-xl px-4 py-2 transition-all text-white border border-transparent hover:border-white/10"
              >
                <span className="text-[11px] font-medium opacity-70">
                  {isLoggedIn ? tNav("hello") : tNav("helloSignin")}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black whitespace-nowrap">{tNav("accountLists")}</span>
                  <CollapseIcon size={12} className="opacity-50" />
                </div>
              </LocalizedClientLink>

              <div className="absolute top-full end-0 z-50 hidden group-hover/account:block bg-white text-gray-900 shadow-2xl rounded-2xl min-w-[280px] mt-2 border border-gray-100 p-5 animate-in fade-in zoom-in-95">
                  {isLoggedIn ? (
                    <div className="space-y-2">
                      <LocalizedClientLink href="/user" className="block px-4 py-2.5 text-sm font-bold hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-colors border-l-4 border-transparent hover:border-brand-400">{tNav("yourAccount")}</LocalizedClientLink>
                      <LocalizedClientLink href="/user/orders" className="block px-4 py-2.5 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors">{t("orders")}</LocalizedClientLink>
                      <LocalizedClientLink href="/user/wishlist" className="block px-4 py-2.5 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors">{t("wishlist")}</LocalizedClientLink>
                      <LocalizedClientLink href="/user/settings" className="block px-4 py-2.5 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors">{t("settings")}</LocalizedClientLink>
                      <div className="border-t border-gray-100 mt-3 pt-3">
                        <LocalizedClientLink href="/logout" className="block px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-center uppercase tracking-tighter">{t("logout")}</LocalizedClientLink>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <LocalizedClientLink href="/login" className="block w-full text-center bg-brand-400 hover:bg-brand-500 text-white py-3 rounded-xl font-black text-sm shadow-lg shadow-brand-400/20 transition-all active:scale-95 uppercase tracking-widest">{t("login")}</LocalizedClientLink>
                      <div className="text-center text-xs text-gray-500 font-medium">
                        {tNav("helloSignin")}? <LocalizedClientLink href="/register" className="text-secondary-600 hover:text-secondary-700 font-bold underline underline-offset-4">{t("register")}</LocalizedClientLink>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Cart */}
            <LocalizedClientLink
              href="/cart"
              className="relative flex items-center gap-3 hover:bg-white/10 rounded-xl px-5 py-2 transition-all group text-white bg-white/5 border border-white/10"
            >
              <div className="relative">
                <CartIcon size={30} color="#F26318" className="group-hover:rotate-12 transition-transform" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -end-2 w-6 h-6 p-0 bg-brand-400 border-2 border-[#0e111a] text-white text-[12px] flex items-center justify-center font-black rounded-full shadow-lg">
                    {cartCount}
                  </Badge>
                )}
              </div>
              <span className="text-sm font-black mt-1 uppercase tracking-wider">{t("cart")}</span>
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
