import type { Metadata } from "next"
import { TrackOrderClient } from "./TrackOrderClient"

export const metadata: Metadata = {
  title: "تتبع طلبك | موجود",
  description: "تتبع حالة طلبك على منصة موجود للتسوق الإلكتروني",
}

export default function TrackOrderPage() {
  return <TrackOrderClient />
}
