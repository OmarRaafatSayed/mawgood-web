"use client"
import { Button, Divider } from "@/components/atoms"
import { Modal, ReportSellerForm } from "@/components/molecules"
import { SellerProps } from "@/types/seller"
import { format } from "date-fns"
import { useState } from "react"
import { useTranslations } from "next-intl"

export const SellerFooter = ({ seller }: { seller: SellerProps }) => {
  const [openModal, setOpenModal] = useState(false)
  const t = useTranslations('seller')

  return (
    <div className="flex justify-between items-center flex-col lg:flex-row p-5">
      <div className="flex gap-2 lg:gap-4 items-center label-sm lg:label-md text-secondary mb-4 lg:mb-0 justify-between w-full lg:justify-start lg:w-auto">
        <Divider square />
        <p>{t('memberSince')} {format(seller.created_at, "yyyy-MM-dd")}</p>
      </div>
      <Button variant="text" size="large" className="uppercase" onClick={() => setOpenModal(true)}>
        {t('reportSeller')}
      </Button>
      {openModal && (
        <Modal heading={t('reportSeller')} onClose={() => setOpenModal(false)}>
          <ReportSellerForm onClose={() => setOpenModal(false)} />
        </Modal>
      )}
    </div>
  )
}
