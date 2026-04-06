import { PencilSquare, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Badge, Container, Heading, Text, usePrompt, toast } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { useSellers } from "../../../../../hooks/api/sellers"
import { sdk } from "../../../../../lib/client"
import { queryClient } from "../../../../../lib/query-client"
import { productsQueryKeys } from "../../../../../hooks/api/products"

type ProductSellerSectionProps = {
  product: HttpTypes.StoreProduct & { seller?: any }
}

export const ProductSellerSection = ({
  product,
}: ProductSellerSectionProps) => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const { sellers } = useSellers({ limit: 100 })

  const seller = product.seller

  const handleAssignSeller = async () => {
    if (!sellers || sellers.length === 0) {
      prompt({
        title: t("products.seller.noSellers"),
        description: t("products.seller.noSellersDescription"),
      })
      return
    }

    const defaultSeller = sellers[0]
    
    try {
      await sdk.client.fetch(`/admin/products/${product.id}`, {
        method: "POST",
        body: { seller_id: defaultSeller.id },
      })
      
      await queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(product.id),
      })
      
      toast.success(t("products.seller.title"), {
        description: t("products.seller.assigned"),
      })
    } catch (error) {
      toast.error(t("general.error"), {
        description: error.message || "Failed to assign seller",
      })
    }
  }

  const handleRemoveSeller = async () => {
    const confirmed = await prompt({
      title: t("products.seller.removeSeller"),
      description: t("products.seller.removeSellerConfirm"),
    })

    if (!confirmed) {
      return
    }

    try {
      await sdk.client.fetch(`/admin/products/${product.id}`, {
        method: "POST",
        body: { seller_id: null },
      })
      
      await queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(product.id),
      })
      
      toast.success(t("products.seller.title"), {
        description: "Seller removed successfully",
      })
    } catch (error) {
      toast.error(t("general.error"), {
        description: error.message || "Failed to remove seller",
      })
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("products.seller.title")}</Heading>
        {seller && (
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    icon: <PencilSquare />,
                    label: t("actions.edit"),
                    onClick: handleAssignSeller,
                  },
                ],
              },
              {
                actions: [
                  {
                    icon: <Trash />,
                    label: t("actions.remove"),
                    onClick: handleRemoveSeller,
                  },
                ],
              },
            ]}
          />
        )}
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        {seller ? (
          <>
            <Text size="small" leading="compact" weight="plus">
              {t("products.seller.seller")}
            </Text>
            <div className="flex items-center gap-2">
              <Text size="small" leading="compact">
                {seller.name}
              </Text>
              <Badge size="2xsmall" color="green">
                {t("products.seller.assigned")}
              </Badge>
            </div>
          </>
        ) : (
          <div className="col-span-2">
            <Text size="small" leading="compact" className="text-ui-fg-muted">
              {t("products.seller.noSeller")}
            </Text>
            <button
              type="button"
              onClick={handleAssignSeller}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover mt-2 text-sm"
            >
              {t("products.seller.assignSeller")}
            </button>
          </div>
        )}
      </div>
    </Container>
  )
}
