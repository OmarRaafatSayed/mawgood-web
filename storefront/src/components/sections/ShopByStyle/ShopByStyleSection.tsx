import Image from "next/image"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ArrowRightIcon } from "@/icons"
import { getTranslations } from "next-intl/server"

export async function ShopByStyleSection() {
  const t = await getTranslations('home')
  const tStyles = await getTranslations('styles')

  const styles = [
    { id: 1, name: tStyles('luxury'),     href: "/collections/luxury" },
    { id: 2, name: tStyles('vintage'),    href: "/collections/vintage" },
    { id: 3, name: tStyles('casual'),     href: "/collections/casual" },
    { id: 4, name: tStyles('streetwear'), href: "/collections/streetwear" },
    { id: 5, name: tStyles('y2k'),        href: "/collections/y2k" },
  ]

  return (
    <section className="bg-primary container">
      <h2 className="heading-lg text-primary mb-12">{t('shopByStyle')}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
        <div className="py-[52px] px-[58px] h-full border rounded-sm">
          {styles.map((style) => (
            <LocalizedClientLink
              key={style.id}
              href={style.href}
              className="group flex items-center gap-4 text-primary hover:text-action transition-colors border-b border-transparent hover:border-primary w-fit pb-2 mb-8"
            >
              <span className="heading-lg">{style.name}</span>
              <ArrowRightIcon className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </LocalizedClientLink>
          ))}
        </div>
        <div className="relative hidden lg:block">
          <Image
            loading="lazy"
            fetchPriority="high"
            src="/images/shop-by-styles/Image.jpg"
            alt={tStyles('imageAlt')}
            width={700}
            height={600}
            className="object-cover rounded-sm w-full h-auto"
          />
        </div>
      </div>
    </section>
  )
}
