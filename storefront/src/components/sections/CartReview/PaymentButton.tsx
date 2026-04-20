"use client"

import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import { isManual } from "../../../lib/constants"
import { placeOrder } from "@/lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/atoms"
import { toast } from "@/lib/helpers/toast"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isManual(paymentSession?.provider_id):
      return (
        <ManualPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      // COD (Cash On Delivery) - default payment method
      return (
        <CashOnDeliveryButton
          notReady={notReady}
          data-testid={dataTestId}
        />
      )
  }
}

const CashOnDeliveryButton = ({
  notReady,
  "data-testid": dataTestId,
}: {
  notReady: boolean
  "data-testid"?: string
}) => {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    try {
      const result = await placeOrder()
      
      const errorMsg = result.error?.message || result.error || 'فشل اتمام الطلب'
      
      if (!result.ok) {
        setErrorMessage(errorMsg)
        toast.error(errorMsg)
        setSubmitting(false)
        return
      }

      const orderId = result.orderId
      console.log('[CashOnDeliveryButton] Order placed, orderId:', orderId)

      // Force navigation on client side (replace to avoid back button to cart)
      if (orderId) {
        router.replace(`/order/${orderId}/confirmed`)
      } else {
        router.refresh()
      }
    } catch (error: any) {
      const errorMsg = error?.message?.replace("Error setting up the request: ", "") || error?.message
      if (errorMsg && errorMsg !== "NEXT_REDIRECT") {
        setErrorMessage(errorMsg)
        toast.error(errorMsg || "حدث خطأ أثناء معالجة الطلب")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <ErrorMessage
        error={errorMessage}
        data-testid="cod-payment-error-message"
      />
      <Button
        onClick={handlePayment}
        disabled={notReady || submitting}
        loading={submitting}
        data-testid={dataTestId}
        className="w-full"
      >
        {submitting ? "جاري المعالجة..." : "اتمام الطلب"}
      </Button>
    </>
  )
}

const ManualPaymentButton = ({
  notReady,
  "data-testid": dataTestId,
}: {
  notReady: boolean
  "data-testid"?: string
}) => {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    try {
      const result = await placeOrder()
      
      const errorMsg = result.error?.message || result.error || 'فشل اتمام الطلب'
      
      if (!result.ok) {
        setErrorMessage(errorMsg)
        toast.error(errorMsg)
        setSubmitting(false)
        return
      }

      const orderId = result.orderId
      console.log('[ManualPaymentButton] Order placed, orderId:', orderId)

      // Force navigation on client side (replace to avoid back button to cart)
      if (orderId) {
        router.replace(`/order/${orderId}/confirmed`)
      } else {
        router.refresh()
      }
    } catch (error: any) {
      const errorMsg = error?.message?.replace("Error setting up the request: ", "") || error?.message
      if (errorMsg && errorMsg !== "NEXT_REDIRECT") {
        setErrorMessage(errorMsg)
        toast.error(errorMsg || "حدث خطأ أثناء معالجة الطلب")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <ErrorMessage error={errorMessage} data-testid="manual-payment-error" />
      <Button
        onClick={handlePayment}
        disabled={notReady || submitting}
        loading={submitting}
        data-testid={dataTestId}
        className="w-full"
      >
        {submitting ? "جاري المعالجة..." : "اتمام الطلب"}
      </Button>
    </>
  )
}

export default PaymentButton
