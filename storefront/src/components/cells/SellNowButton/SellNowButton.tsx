import { Button } from "@/components/atoms"
import { ArrowRightIcon } from "@/icons"
import Link from "next/link"
import { useTranslations } from "next-intl"

export const SellNowButton = () => {
  const t = useTranslations('common')
  return (
    <Link href={process.env.NEXT_PUBLIC_VENDOR_URL || "https://vendor.mercurjs.com"}>
      <Button className="group uppercase !font-bold pl-12 gap-1 flex items-center">
        {t('sellNow')}
        <ArrowRightIcon
          color="white"
          className="w-5 h-5 group-hover:opacity-100 opacity-0 transition-all duration-300"
        />
      </Button>
    </Link>
  )
}
