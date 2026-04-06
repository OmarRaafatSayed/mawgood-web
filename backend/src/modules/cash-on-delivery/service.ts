import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import { PaymentProviderError, PaymentProviderSessionResponse } from "@medusajs/framework/types"

class CashOnDeliveryProviderService extends AbstractPaymentProvider {
  static identifier = "cash-on-delivery"

  async capturePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProviderError> {
    return {
      status: "captured",
      data: paymentSessionData,
    }
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<
    | PaymentProviderError
    | {
        status: string
        data: Record<string, unknown>
      }
  > {
    return {
      status: "authorized",
      data: paymentSessionData,
    }
  }

  async cancelPayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProviderError> {
    return {
      status: "canceled",
      data: paymentSessionData,
    }
  }

  async initiatePayment(
    context: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    return {
      data: {
        status: "pending",
        payment_method: "cash_on_delivery",
      },
    }
  }

  async deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProviderError> {
    return {
      status: "deleted",
      data: paymentSessionData,
    }
  }

  async getPaymentStatus(
    paymentSessionData: Record<string, unknown>
  ): Promise<string> {
    return paymentSessionData.status as string
  }

  async refundPayment(
    paymentSessionData: Record<string, unknown>,
    refundAmount: number
  ): Promise<Record<string, unknown> | PaymentProviderError> {
    return {
      status: "refunded",
      data: paymentSessionData,
    }
  }

  async retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProviderError> {
    return {
      status: "retrieved",
      data: paymentSessionData,
    }
  }

  async updatePayment(
    context: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    return {
      data: context,
    }
  }

  async getWebhookActionAndData(
    data: Record<string, unknown>
  ): Promise<{
    action: string
    data: Record<string, unknown>
  }> {
    return {
      action: "not_supported",
      data: {},
    }
  }
}

export default CashOnDeliveryProviderService
