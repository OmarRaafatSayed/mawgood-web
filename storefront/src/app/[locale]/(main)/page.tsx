import {
  HeroSlider,
  HomeCategories,
  HomeProductSection,
  BrandsCarousel,
  BannerSection,
  FeaturedCategoriesSection,
} from "@/components/sections"

import type { Metadata } from "next"
import { headers } from "next/headers"
import Script from "next/script"
import { getTranslations } from 'next-intl/server'
import { listRegions } from "@/lib/data/regions"
import { toHreflang } from "@/lib/helpers/hreflang"

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

  // Build alternates based on available regions (locales)
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
    // Fallback: only current locale
    languages = { [toHreflang(locale)]: `${baseUrl}/${locale}` }
  }

  const title = "موجود - تسوق حسب الفئة"
  const description =
    "اكتشف تشكيلة واسعة من المنتجات حسب الفئة. تسوق إلكترونيات، أزياء، منزل ومطبخ، جمال، رياضة والمزيد في موجود."
  const ogImage = "/B2C_Storefront_Open_Graph.png"
  const canonical = `${baseUrl}/${locale}`

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": baseUrl,
      },
    },
    openGraph: {
      title: `${title} | ${
        process.env.NEXT_PUBLIC_SITE_NAME ||
        "موجود - Marketplace Storefront"
      }`,
      description,
      url: canonical,
      siteName:
        process.env.NEXT_PUBLIC_SITE_NAME ||
        "موجود - Marketplace Storefront",
      type: "website",
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt:
            process.env.NEXT_PUBLIC_SITE_NAME ||
            "موجود - Marketplace Storefront",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`],
    },
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('featuredCategories')

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  const siteName =
    process.env.NEXT_PUBLIC_SITE_NAME ||
    "موجود - Marketplace Storefront"

  // Featured categories data - will be dynamic from API in production
  const featuredSections = [
    {
      id: 'new-arrivals',
      title: t('newArrivals'),
      link: '/categories/new-arrivals',
      categories: [
        { id: 'na1', name: 'إلكترونيات جديدة', handle: 'new-electronics', icon: '📱' },
        { id: 'na2', name: 'أزياء حديثة', handle: 'new-fashion', icon: '👗' },
        { id: 'na3', name: 'منزل عصري', handle: 'new-home', icon: '🏠' },
        { id: 'na4', name: 'جمال مبتكر', handle: 'new-beauty', icon: '💄' },
        { id: 'na5', name: 'رياضة ولياقة', handle: 'new-sports', icon: '🏃' },
        { id: 'na6', name: 'ألعاب جديدة', handle: 'new-toys', icon: '🎮' },
      ]
    },
    {
      id: 'best-sellers',
      title: t('bestSellers'),
      link: '/categories/best-sellers',
      categories: [
        { id: 'bs1', name: 'أكثر مبيعاً', handle: 'best-electronics', icon: '📱' },
        { id: 'bs2', name: 'أزياء رائجة', handle: 'best-fashion', icon: '👕' },
        { id: 'bs3', name: 'منزل شعبي', handle: 'best-home', icon: '🏡' },
        { id: 'bs4', name: 'جمال محبوب', handle: 'best-beauty', icon: '💋' },
        { id: 'bs5', name: 'رياضة شائعة', handle: 'best-sports', icon: '⚽' },
        { id: 'bs6', name: 'ألعاب مطلوبة', handle: 'best-toys', icon: '🧸' },
      ]
    },
    {
      id: 'trending',
      title: t('trending'),
      link: '/categories/trending',
      categories: [
        { id: 'tr1', name: 'رائج الآن', handle: 'trend-electronics', icon: '🔥' },
        { id: 'tr2', name: 'موضة ساخنة', handle: 'trend-fashion', icon: '👠' },
        { id: 'tr3', name: 'منزل عصري', handle: 'trend-home', icon: '🛋️' },
        { id: 'tr4', name: 'جمال تريند', handle: 'trend-beauty', icon: '💅' },
        { id: 'tr5', name: 'رياضة رائجة', handle: 'trend-sports', icon: '🏀' },
        { id: 'tr6', name: 'ألعاب تريند', handle: 'trend-toys', icon: '🎯' },
      ]
    },
    {
      id: 'special-offers',
      title: t('specialOffers'),
      link: '/categories/special-offers',
      categories: [
        { id: 'so1', name: 'عروض إلكترونيات', handle: 'offer-electronics', icon: '🏷️' },
        { id: 'so2', name: 'خصومات أزياء', handle: 'offer-fashion', icon: '👔' },
        { id: 'so3', name: 'تخفيضات منزل', handle: 'offer-home', icon: '🏘️' },
        { id: 'so4', name: 'عروض جمال', handle: 'offer-beauty', icon: '🎁' },
        { id: 'so5', name: 'خصومات رياضة', handle: 'offer-sports', icon: '🎽' },
        { id: 'so6', name: 'تخفيضات ألعاب', handle: 'offer-toys', icon: '🎪' },
      ]
    },
    {
      id: 'premium-brands',
      title: t('premiumBrands'),
      link: '/categories/premium',
      categories: [
        { id: 'pb1', name: 'إلكترونيات فاخرة', handle: 'premium-electronics', icon: '💎' },
        { id: 'pb2', name: 'أزياء فاخرة', handle: 'premium-fashion', icon: '👑' },
        { id: 'pb3', name: 'منزل راقي', handle: 'premium-home', icon: '🏰' },
        { id: 'pb4', name: 'جمال بريميوم', handle: 'premium-beauty', icon: '✨' },
        { id: 'pb5', name: 'رياضة احترافية', handle: 'premium-sports', icon: '🏆' },
        { id: 'pb6', name: 'ألعاب مميزة', handle: 'premium-toys', icon: '⭐' },
      ]
    },
    {
      id: 'seasonal',
      title: t('seasonalPicks'),
      link: '/categories/seasonal',
      categories: [
        { id: 'sp1', name: 'مختارات موسمية', handle: 'seasonal-electronics', icon: '🍂' },
        { id: 'sp2', name: 'أزياء الموسم', handle: 'seasonal-fashion', icon: '🧥' },
        { id: 'sp3', name: 'منزل موسمي', handle: 'seasonal-home', icon: '🎄' },
        { id: 'sp4', name: 'جمال موسمي', handle: 'seasonal-beauty', icon: '🌸' },
        { id: 'sp5', name: 'رياضة موسمية', handle: 'seasonal-sports', icon: '⛷️' },
        { id: 'sp6', name: 'ألعاب موسمية', handle: 'seasonal-toys', icon: '🎃' },
      ]
    },
  ]

  return (
    <main className="flex flex-col gap-0 row-start-2 items-center sm:items-start text-primary">
      <link
        rel="preload"
        as="image"
        href="/images/hero/Image.jpg"
        imageSrcSet="/images/hero/Image.jpg 700w"
        imageSizes="(min-width: 1024px) 50vw, 100vw"
      />
      {/* Organization JSON-LD */}
      <Script
        id="ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteName,
            url: `${baseUrl}/${locale}`,
            logo: `${baseUrl}/favicon.ico`,
          }),
        }}
      />
      {/* WebSite JSON-LD */}
      <Script
        id="ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteName,
            url: `${baseUrl}/${locale}`,
            inLanguage: toHreflang(locale),
          }),
        }}
      />

      {/* Hero Slider - Images Only */}
      <HeroSlider
        slides={[
          {
            id: '1',
            image: '/images/hero/Image.jpg',
          },
          {
            id: '2',
            image: '/images/hero/Image.jpg',
          },
          {
            id: '3',
            image: '/images/hero/Image.jpg',
          }
        ]}
      />
      
      {/* Featured Category Sections - Dynamic */}
      {featuredSections.map((section) => (
        <div key={section.id} className="w-full">
          <FeaturedCategoriesSection
            sectionTitle={section.title}
            viewAllLink={section.link}
            categories={section.categories}
          />
        </div>
      ))}

      {/* All Categories Section */}
      <div className="w-full">
        <HomeCategories />
      </div>

      {/* Trending Products */}
      <div className="px-4 lg:px-8 w-full">
        <HomeProductSection heading="الأكثر رواجاً" locale={locale} home />
      </div>

      {/* Brands Carousel - Auto Sliding */}
      <div className="w-full">
        <BrandsCarousel autoPlay={true} autoPlayInterval={3000} />
      </div>

      {/* Banner Section */}
      <div className="w-full">
        <BannerSection />
      </div>
    </main>
  )
}
