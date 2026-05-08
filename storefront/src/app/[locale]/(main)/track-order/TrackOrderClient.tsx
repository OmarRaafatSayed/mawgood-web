"use client"

import { useState } from "react"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const ORDER_STATUSES = [
  { key: "pending",    label: "تم استلام الطلب",  icon: "📋", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { key: "confirmed",  label: "تم تأكيد الطلب",   icon: "✅", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { key: "processing", label: "جاري التجهيز",      icon: "📦", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { key: "shipped",    label: "في الطريق إليك",    icon: "🚚", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { key: "delivered",  label: "تم التسليم",        icon: "🎉", color: "bg-green-100 text-green-700 border-green-200" },
]

export function TrackOrderClient() {
  const [orderNumber, setOrderNumber] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) {
      setError("يرجى إدخال رقم الطلب")
      return
    }
    setError("")
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setIsLoading(false)
    setSearched(true)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">

        {/* Header */}
        <div className="mb-8 text-center" dir="rtl">
          <div className="text-4xl mb-3">📦</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">تتبع طلبك</h1>
          <p className="text-gray-500 text-sm">أدخل رقم طلبك لمعرفة حالته الحالية</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6" dir="rtl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                رقم الطلب <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={e => { setOrderNumber(e.target.value); setError(""); setSearched(false) }}
                placeholder="مثال: ORD-2026-00123"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F36418]/30 focus:border-[#F36418] transition-colors"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                البريد الإلكتروني <span className="text-gray-400 font-normal">(اختياري)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني المستخدم في الطلب"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F36418]/30 focus:border-[#F36418] transition-colors"
                dir="ltr"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm flex items-center gap-1.5">
                <span>⚠️</span> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#F36418] hover:bg-[#D9560F] text-white font-bold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري البحث...
                </>
              ) : "تتبع الطلب"}
            </button>
          </form>
        </div>

        {/* Result - Not Found */}
        {searched && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6" dir="rtl">
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-bold text-gray-900 mb-2">لم يتم العثور على الطلب</h3>
              <p className="text-sm text-gray-500 mb-5">
                تأكد من رقم الطلب أو تواصل مع خدمة العملاء
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="tel:19911"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F36418] text-white rounded-xl text-sm font-semibold hover:bg-[#D9560F] transition-colors"
                >
                  📞 اتصل بنا: 19911
                </a>
                <LocalizedClientLink
                  href="/user/orders"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  طلباتي
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        )}

        {/* Order stages */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6" dir="rtl">
          <h2 className="text-base font-bold text-gray-900 mb-5">مراحل الطلب</h2>
          <div className="space-y-4">
            {ORDER_STATUSES.map((status, index) => (
              <div key={status.key} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg ${status.color}`}>
                    {status.icon}
                  </div>
                  {index < ORDER_STATUSES.length - 1 && (
                    <div className="w-0.5 h-6 bg-gray-200 mt-1" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{status.label}</p>
                  {status.key === "shipped" && (
                    <p className="text-xs text-gray-500 mt-0.5">ستصلك رسالة SMS برقم التتبع</p>
                  )}
                  {status.key === "delivered" && (
                    <p className="text-xs text-gray-500 mt-0.5">يمكنك الإرجاع خلال 14 يوماً</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help */}
        <div className="bg-[#FFF3E0] border border-[#F36418]/20 rounded-2xl p-5" dir="rtl">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">تحتاج مساعدة؟</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="tel:19911"
              className="flex items-center gap-2 p-3 bg-white rounded-xl text-sm text-gray-700 hover:shadow-sm transition-shadow"
            >
              <span className="text-xl">📞</span>
              <div>
                <p className="font-semibold">اتصل بنا</p>
                <p className="text-xs text-gray-500">19911</p>
              </div>
            </a>
            <a
              href="mailto:support@mawgood.com"
              className="flex items-center gap-2 p-3 bg-white rounded-xl text-sm text-gray-700 hover:shadow-sm transition-shadow"
            >
              <span className="text-xl">✉️</span>
              <div>
                <p className="font-semibold">راسلنا</p>
                <p className="text-xs text-gray-500">support@mawgood.com</p>
              </div>
            </a>
            <LocalizedClientLink
              href="/return-policy"
              className="flex items-center gap-2 p-3 bg-white rounded-xl text-sm text-gray-700 hover:shadow-sm transition-shadow"
            >
              <span className="text-xl">🔄</span>
              <div>
                <p className="font-semibold">سياسة الإرجاع</p>
                <p className="text-xs text-gray-500">إرجاع خلال 14 يوم</p>
              </div>
            </LocalizedClientLink>
          </div>
        </div>

      </div>
    </main>
  )
}
