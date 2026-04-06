'use client'

import { HttpTypes } from '@medusajs/types'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { useTranslations } from 'next-intl'

interface Props {
  categories: HttpTypes.StoreProductCategory[]
  onLinkClick?: () => void
  title?: string
  titleHandle?: string
}

export const ChildCategories = ({ categories, onLinkClick, title, titleHandle }: Props) => {
  const tCat = useTranslations('categoryNames')

  const getCategoryName = (handle: string, name: string) => {
    try { return tCat(handle as any) } catch { return name }
  }

  if (!categories || categories.length === 0) return null

  return (
    <div className="flex flex-col gap-y-2">
      {title && (
        <h3 className="heading-sm uppercase text-primary">
          {getCategoryName(titleHandle || title.toLowerCase(), title)}
        </h3>
      )}
      {categories.map((category) => (
        <LocalizedClientLink
          key={category.id}
          href={`/categories/${category.handle}`}
          onClick={onLinkClick}
          className="label-md text-primary hover:text-action transition-colors py-1"
        >
          {getCategoryName(category.handle, category.name)}
        </LocalizedClientLink>
      ))}
    </div>
  )
}
