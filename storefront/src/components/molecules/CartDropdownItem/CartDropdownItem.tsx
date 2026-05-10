"use client"

import { convertToLocale } from "@/lib/helpers/money"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState } from "react"

const FALLBACK = "/images/placeholder.svg"

export const CartDropdownItem = ({
  item,
  currency_code,
}: {
  item: HttpTypes.StoreCartLineItem
  currency_code: string
}) => {
  const [imgSrc, setImgSrc] = useState(
    item.thumbnail ? decodeURIComponent(item.thumbnail) : FALLBACK
  )
  const [errored, setErrored] = useState(false)

  const total = convertToLocale({
    amount: item.subtotal ?? 0,
    currency_code,
  })

  return (
    <div className="border rounded-sm p-1 flex gap-2 mb-4">
      <div className="w-[100px] h-[132px] flex items-center justify-center">
        <Image
          src={imgSrc}
          alt={item.product_title || "Product"}
          width={80}
          height={90}
          className="w-[80px] h-[90px] object-cover rounded-xs"
          onError={() => {
            if (!errored) { setErrored(true); setImgSrc(FALLBACK) }
          }}
          priority
        />
      </div>

      <div className="py-2">
        <h4 className="heading-xs">{item.product_title}</h4>
        <div className="label-md text-secondary">
          {item.variant?.options?.map(({ option, id, value }) => (
            <p key={id}>
              {option?.title}: <span className="text-primary">{value}</span>
            </p>
          ))}
          <p>
            Quantity: <span className="text-primary">{item.quantity}</span>
          </p>
        </div>
        <div className="pt-2 flex items-center gap-2 mt-4 lg:mt-0">
          <p className="label-lg">{total}</p>
        </div>
      </div>
    </div>
  )
}
