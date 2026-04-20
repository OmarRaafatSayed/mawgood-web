import { HttpTypes } from "@medusajs/types"
import { getPercentageDiff } from "./get-precentage-diff"
import { convertToLocale } from "./money"

export const getPricesForVariant = (variant: any) => {
  const hasCalculatedPrice = variant?.calculated_price?.calculated_amount_with_tax || variant?.calculated_price?.calculated_amount
  const hasRawPrices = variant?.prices?.length > 0
  
  if (!hasCalculatedPrice && !hasRawPrices) {
    return null
  }

  const currency_code = variant.calculated_price?.currency_code || variant.prices?.[0]?.currency_code || 'egp'
  const amount = variant.calculated_price?.calculated_amount || variant.calculated_price?.calculated_amount_with_tax || variant.prices?.[0]?.amount || 0

  if (!variant?.calculated_price?.calculated_amount_with_tax) {
    return {
      calculated_price_number: amount,
      calculated_price: convertToLocale({
        amount: amount,
        currency_code: currency_code,
      }),
      calculated_price_without_tax: convertToLocale({
        amount: amount,
        currency_code: currency_code,
      }),
      calculated_price_without_tax_number: amount,
      original_price_number: amount,
      original_price: convertToLocale({
        amount: amount,
        currency_code: currency_code,
      }),
      currency_code: currency_code,
      price_type: variant.calculated_price?.calculated_price?.price_list_type || null,
      percentage_diff: 0,
    }
  }

  return {
    calculated_price_number:
      variant.calculated_price.calculated_amount_with_tax,
    calculated_price: convertToLocale({
      amount: variant.calculated_price.calculated_amount_with_tax,
      currency_code: variant.calculated_price.currency_code,
    }),
    calculated_price_without_tax: convertToLocale({
      amount: variant.calculated_price.calculated_price_without_tax,
      currency_code: variant.calculated_price.currency_code,
    }),
    calculated_price_without_tax_number:
      variant.calculated_price.calculated_price_without_tax,
    original_price_number: variant.calculated_price.original_amount_with_tax,
    original_price: convertToLocale({
      amount: variant.calculated_price.original_amount_with_tax,
      currency_code: variant.calculated_price.currency_code,
    }),
    currency_code: variant.calculated_price.currency_code,
    price_type: variant.calculated_price.calculated_price.price_list_type,
    percentage_diff: getPercentageDiff(
      variant.calculated_price.original_amount,
      variant.calculated_price.calculated_amount
    ),
  }
}

export function getProductPrice({
  product,
  variantId,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
}) {
  if (!product || !product.id) {
    throw new Error("No product provided")
  }

  const cheapestVariant = () => {
    if (!product || !product.variants?.length) {
      return null
    }

    return product.variants
      .filter((v: any) => !!v.calculated_price || !!v.prices?.length)
      .sort((a: any, b: any) => {
        const aPrice = a.calculated_price?.calculated_amount_with_tax || a.calculated_price?.calculated_amount || a.prices?.[0]?.amount || 0
        const bPrice = b.calculated_price?.calculated_amount_with_tax || b.calculated_price?.calculated_amount || b.prices?.[0]?.amount || 0
        return aPrice - bPrice
      })[0]
  }

  const cheapestPrice = () => {
    if (!product || !product.variants?.length) {
      return null
    }

    const variant: any = cheapestVariant()

    return getPricesForVariant(variant)
  }

  const variantPrice = () => {
    if (!product || !variantId) {
      return null
    }

    const variant: any = product.variants?.find(
      (v: any) => v.id === variantId || v.sku === variantId
    )

    if (!variant) {
      return null
    }

    return getPricesForVariant(variant)
  }

  return {
    product,
    cheapestPrice: cheapestPrice(),
    variantPrice: variantPrice(),
    cheapestVariant: cheapestVariant(),
  }
}
