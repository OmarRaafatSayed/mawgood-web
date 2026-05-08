import type { Metadata } from "next"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const metadata: Metadata = {
  title: "سياسة الإرجاع والاستبدال | موجود",
  description: "سياسة الإرجاع والاستبدال لمنصة موجود - إرجاع مجاني خلال 14 يوم",
}

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            سياسة الإرجاع والاستبدال
          </h1>
          <p className="text-sm text-gray-500">آخر تحديث: مايو 2026</p>
        </div>

        {/* Highlight banner */}
        <div className="bg-[#FFF3E0] border border-[#F36418]/20 rounded-2xl p-5 mb-6 flex items-center gap-4" dir="rtl">
          <div className="text-3xl flex-shrink-0">🔄</div>
          <div>
            <p className="font-bold text-gray-900 text-base">إرجاع مجاني خلال 14 يوماً</p>
            <p className="text-sm text-gray-600 mt-0.5">
              نضمن لك حق الإرجاع أو الاستبدال خلال 14 يوماً من تاريخ الاستلام دون أي رسوم إضافية.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8 text-gray-700 leading-relaxed" dir="rtl">

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">١. شروط الإرجاع</h2>
            <p className="mb-3">يحق لك إرجاع المنتج خلال <strong>14 يوماً</strong> من تاريخ الاستلام بشرط:</p>
            <ul className="space-y-2 list-none">
              {[
                "أن يكون المنتج في حالته الأصلية غير مستخدم وغير مغسول",
                "أن يكون بعبوته الأصلية مع جميع الملصقات والبطاقات",
                "أن يكون مصحوباً بفاتورة الشراء أو رقم الطلب",
                "ألا يكون المنتج من الفئات المستثناة من الإرجاع",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#F36418] flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">٢. المنتجات المستثناة من الإرجاع</h2>
            <ul className="space-y-2 list-none">
              {[
                "الملابس الداخلية وملابس السباحة لأسباب صحية",
                "المنتجات التي تم تعديلها أو تفصيلها حسب الطلب",
                "المنتجات التي تظهر عليها علامات الاستخدام أو الغسيل",
                "المنتجات المكسورة أو التالفة بسبب سوء الاستخدام",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3 - Steps */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">٣. خطوات طلب الإرجاع</h2>
            <div className="space-y-4">
              {[
                {
                  step: "١",
                  title: "تواصل معنا",
                  desc: "اتصل بخدمة العملاء على 19911 أو أرسل بريداً إلكترونياً على returns@mawgood.com مع ذكر رقم طلبك وسبب الإرجاع",
                },
                {
                  step: "٢",
                  title: "تأكيد الطلب",
                  desc: "سيتواصل معك فريقنا خلال 24 ساعة لتأكيد طلب الإرجاع وتحديد موعد الاستلام",
                },
                {
                  step: "٣",
                  title: "استلام المنتج",
                  desc: "سيأتي مندوبنا لاستلام المنتج من عنوانك مجاناً في الموعد المحدد",
                },
                {
                  step: "٤",
                  title: "الفحص والاسترداد",
                  desc: "بعد فحص المنتج والتأكد من استيفاء شروط الإرجاع، يتم رد المبلغ خلال 5-7 أيام عمل",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F36418] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">٤. طرق استرداد المبلغ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: "💳", title: "البطاقة البنكية", desc: "خلال 5-7 أيام عمل" },
                { icon: "📱", title: "المحفظة الإلكترونية", desc: "خلال 24-48 ساعة" },
                { icon: "🏦", title: "تحويل بنكي", desc: "خلال 3-5 أيام عمل" },
                { icon: "🎁", title: "رصيد في المنصة", desc: "فوري ويمكن استخدامه في أي طلب" },
              ].map((method) => (
                <div key={method.title} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{method.title}</p>
                    <p className="text-xs text-gray-500">{method.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">٥. الاستبدال</h2>
            <p className="mb-3">
              يمكنك استبدال المنتج بمقاس أو لون مختلف خلال 14 يوماً من الاستلام. في حال كان المنتج البديل بسعر أعلى، يتم دفع الفرق. وإذا كان بسعر أقل، يُرد الفرق لك.
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
              💡 <strong>نصيحة:</strong> الاستبدال أسرع من الإرجاع واسترداد المبلغ. إذا كنت تريد نفس المنتج بمقاس مختلف، اختر الاستبدال.
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">٦. المنتجات التالفة أو الخاطئة</h2>
            <p>
              إذا استلمت منتجاً تالفاً أو مختلفاً عما طلبته، يُرجى التواصل معنا خلال <strong>48 ساعة</strong> من الاستلام مع إرفاق صور للمنتج. سنقوم باستبداله فوراً أو رد المبلغ كاملاً دون أي شروط.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* CTA */}
          <section className="text-center">
            <p className="text-gray-600 mb-4">هل تريد إرجاع منتج؟</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:19911"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#F36418] text-white rounded-xl font-semibold text-sm hover:bg-[#D9560F] transition-colors"
              >
                📞 اتصل بنا: 19911
              </a>
              <a
                href="mailto:returns@mawgood.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#F36418] text-[#F36418] rounded-xl font-semibold text-sm hover:bg-[#FFF3E0] transition-colors"
              >
                ✉️ returns@mawgood.com
              </a>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}
