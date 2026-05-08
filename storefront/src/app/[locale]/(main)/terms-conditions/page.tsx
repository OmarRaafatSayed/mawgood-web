import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "الشروط والأحكام | موجود",
  description: "الشروط والأحكام لمنصة موجود للتسوق الإلكتروني",
}

export default function TermsConditionsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            الشروط والأحكام
          </h1>
          <p className="text-sm text-gray-500">آخر تحديث: مايو 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8 text-gray-700 leading-relaxed" dir="rtl">

          {/* Intro */}
          <section>
            <p className="text-base">
              مرحباً بك في <strong>موجود</strong>، منصة التسوق الإلكتروني المتكاملة. باستخدامك للموقع أو التطبيق، فإنك توافق على الالتزام بهذه الشروط والأحكام. يُرجى قراءتها بعناية قبل إتمام أي عملية شراء.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">١. التعريفات</h2>
            <ul className="space-y-2 list-none">
              {[
                { term: "المنصة", def: "موقع وتطبيق موجود للتسوق الإلكتروني" },
                { term: "المستخدم", def: "أي شخص يتصفح المنصة أو يسجّل حساباً أو يُجري عملية شراء" },
                { term: "البائع", def: "أي تاجر أو متجر مسجّل على المنصة لعرض وبيع منتجاته" },
                { term: "الطلب", def: "عملية الشراء التي يُتمّها المستخدم عبر المنصة" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#F36418] flex-shrink-0" />
                  <span><strong>{item.term}:</strong> {item.def}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">٢. التسجيل والحساب</h2>
            <ul className="space-y-2 list-none">
              {[
                "يجب أن يكون عمرك 18 عاماً أو أكثر لإنشاء حساب والشراء عبر المنصة",
                "أنت مسؤول عن الحفاظ على سرية بيانات حسابك وكلمة مرورك",
                "يجب تقديم معلومات صحيحة ودقيقة عند التسجيل",
                "يحق لنا تعليق أو إلغاء أي حساب يُخالف هذه الشروط",
                "لا يجوز إنشاء أكثر من حساب واحد لنفس الشخص",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#F36418] flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">٣. الطلبات والدفع</h2>
            <ul className="space-y-2 list-none">
              {[
                "تُعدّ الطلبات مؤكدة فور استلام رسالة تأكيد الطلب على بريدك الإلكتروني",
                "الأسعار المعروضة بالجنيه المصري وتشمل ضريبة القيمة المضافة",
                "نحتفظ بالحق في تعديل الأسعار دون إشعار مسبق",
                "في حال وجود خطأ في السعر، سنتواصل معك قبل تنفيذ الطلب",
                "نقبل الدفع بالبطاقات البنكية والمحافظ الإلكترونية والدفع عند الاستلام",
                "جميع المعاملات المالية مشفّرة وآمنة",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#F36418] flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">٤. الشحن والتوصيل</h2>
            <ul className="space-y-2 list-none">
              {[
                "مواعيد التوصيل تقديرية وقد تتأثر بالظروف الخارجة عن إرادتنا",
                "يتحمل المستخدم مسؤولية تقديم عنوان توصيل صحيح ودقيق",
                "في حال غياب المستلم، سيُعاد التوصيل مرة أخرى أو يُودَع في أقرب نقطة استلام",
                "تكاليف الشحن محددة عند إتمام الطلب وقد تختلف حسب المنطقة الجغرافية",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#F36418] flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">٥. الملكية الفكرية</h2>
            <p>
              جميع المحتويات على المنصة من نصوص وصور وشعارات وتصاميم هي ملك لمنصة <strong>موجود</strong> أو مرخّصة لها. لا يجوز نسخ أو توزيع أو استخدام أي محتوى دون إذن كتابي مسبق.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">٦. حدود المسؤولية</h2>
            <p className="mb-3">
              تعمل <strong>موجود</strong> كوسيط بين المشترين والبائعين. لذلك:
            </p>
            <ul className="space-y-2 list-none">
              {[
                "لسنا مسؤولين عن جودة المنتجات المقدّمة من البائعين المستقلين",
                "لسنا مسؤولين عن أي أضرار غير مباشرة ناتجة عن استخدام المنصة",
                "مسؤوليتنا القصوى لا تتجاوز قيمة الطلب المعني",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#F36418] flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 7 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">٧. تعديل الشروط</h2>
            <p>
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على المنصة. استمرارك في استخدام المنصة بعد التعديل يُعدّ موافقةً على الشروط الجديدة.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 8 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">٨. القانون المطبّق</h2>
            <p>
              تخضع هذه الشروط لقوانين جمهورية مصر العربية، وتختص المحاكم المصرية بالفصل في أي نزاع ينشأ عنها.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Contact */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">٩. التواصل معنا</h2>
            <div className="space-y-1 text-sm">
              <p>📧 <a href="mailto:legal@mawgood.com" className="text-[#F36418] hover:underline">legal@mawgood.com</a></p>
              <p>📞 <a href="tel:19911" className="text-[#F36418] hover:underline">19911</a></p>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}
