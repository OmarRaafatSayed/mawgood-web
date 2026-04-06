"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { Input } from "@/components/atoms"
import { Accordion } from "@/components/molecules"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { DollarIcon } from "@/icons"

export const PriceFilter = () => {
  const [min, setMin] = useState("")
  const [max, setMax] = useState("")
  const t = useTranslations('filters')

  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMin(searchParams.get("min_price") || "")
    setMax(searchParams.get("max_price") || "")
  }, [searchParams])

  const updateMinPriceHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateSearchParams("min_price", min)
  }

  const updateMaxPriceHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateSearchParams("max_price", max)
  }

  return (
    <Accordion heading={t('priceRange')} data-testid="filter-price">
      <div className="flex gap-2 mb-4" data-testid="filter-price-inputs">
        <form method="POST" onSubmit={updateMinPriceHandler}>
          <Input
            placeholder={t('minPrice')}
            icon={<DollarIcon size={16} />}
            onChange={(e) => setMin(e.target.value)}
            value={min}
            type="number"
            className="no-arrows-number-input"
            data-testid="filter-price-min"
          />
          <input type="submit" className="hidden" />
        </form>
        <form method="POST" onSubmit={updateMaxPriceHandler}>
          <Input
            placeholder={t('maxPrice')}
            icon={<DollarIcon size={16} />}
            onChange={(e) => setMax(e.target.value)}
            type="number"
            className="no-arrows-number-input"
            value={max}
            data-testid="filter-price-max"
          />
          <input type="submit" className="hidden" />
        </form>
      </div>
    </Accordion>
  )
}
