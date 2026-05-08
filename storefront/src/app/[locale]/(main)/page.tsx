import {
  HeroSlider,
  HomeCategories,
  HomeProductSection,
  BrandsCarousel,
} from "@/components/sections"

import type { Metadata } from "next"
import { headers } from "next/headers"
import Script from "next/script"
import { listRegions } from "@/lib/data/regions"
import { toHreflang } from "@/lib/helpers/hreflang"
import { listCategories } from "@/lib/data/categories"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  let languages: Record<string, string> = {}
  try {
    const regions = await listRegions()
    const locales = Array.from(
      new Set(
        (regions || [])
          .map((r) => r.countries?.map((c) => c.iso_2) || [])
          .flat()
          .filter(Boolean)
      )
    ) as string[]

    languages = locales.reduce<Record<string, string>>((acc, code) => {
      const hrefLang = toHreflang(code)
      acc[hrefLang] = `${baseUrl}/${code}`
      return acc
    }, {})
  } catch {
    languages = { [toHreflang(locale)]: `${baseUrl}/${locale}` }
  }

  const title = "موجود - تسوق حسب الفئة"
  const description =
    "اكتشف تشكيلة واسعة من المنتجات. تسوق ملابس، قمصان، فساتين والمزيد في موجود."
  const ogImage = "/B2C_Storefront_Open_Graph.png"
  const canonical = `${baseUrl}/${locale}`

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: { ...languages, "x-default": baseUrl },
    },
    openGraph: {
      title: `${title} | ${process.env.NEXT_PUBLIC_SITE_NAME || "موجود"}`,
      description,
      url: canonical,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "موجود",
      type: "website",
      images: [{ url: ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`, width: 1200, height: 630 }],
    },
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "موجود"

  // Fetch real categories from API
  let realCategories: any[] = []
  try {
    const { parentCategories, categories } = await listCategories()
    // Use parent categories if they exist, otherwise use all categories
    realCategories = parentCategories.length > 0 ? parentCategories : categories
  } catch {
    realCategories = []
  }

  return (
    <main className="flex flex-col gap-0 w-full text-primary bg-gray-50">
      <link
        rel="preload"
        as="image"
        href="/images/hero/banner-web-1.png"
        // @ts-ignore
        imageSrcSet="/images/hero/banner-web-1.png 1200w"
        imageSizes="100vw"
      />
      <Script
        id="ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteName,
            url: `${baseUrl}/${locale}`,
          }),
        }}
      />

      {/* ── Hero Slider ── */}
      <HeroSlider
        slides={[
          {
            id: "1",
            image: "/images/hero/banner-web-1.png",
            imageMobile: "/images/hero/banner-mobile-1.png",
          },
          {
            id: "2",
            image: "/images/hero/banner-web-2.png",
            imageMobile: "/images/hero/banner-mobile-2.png",
          },
          {
            id: "3",
            image: "/images/hero/banner-web-3.png",
            imageMobile: "/images/hero/banner-mobile-1.png",
          },
        ]}
      />

      {/* ── Real Categories from DB ── */}
      <div className="w-full bg-white">
        <HomeCategories categories={realCategories} />
      </div>

      {/* ── Latest Products ── */}
      <div className="w-full bg-white mt-2">
        <div className="px-4 lg:px-8 py-6">
          <HomeProductSection heading="أحدث المنتجات" locale={locale} home />
        </div>
      </div>

      {/* ── Brands ── */}
      <div className="w-full bg-white mt-2">
        <BrandsCarousel autoPlay={true} autoPlayInterval={3000} />
      </div>
    </main>
  )
}
