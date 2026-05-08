import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "سياسة الخصوصية | موجود",
  description: "سياسة الخصوصية لمنصة موجود للتسوق الإلكتروني",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            سياسة الخصوصية
          </h1>
          <p className="text-sm text-gray-500">آخر تحديث: مايو 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8 text-gray-700 leading-relaxed" dir="rtl">

          {/* Intro */}
          <section>
            <p className="text-base">
              نرحب بك في منصة <strong>موجود</strong>. نحن نُقدّر ثقتك بنا ونلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها عند استخدامك لموقعنا وتطبيقنا.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">١. المعلومات التي نجمعها</h2>
            <p className="mb-3">نجمع المعلومات التالية عند تسجيلك أو استخدامك للمنصة:</p>
            <ul className="space-y-2 list-none">
              {[
                "الاسم الكامل وعنوان البريد الإلكتروني ورقم الهاتف",
                "عنوان التوصيل والمحافظة والرمز البريدي",
                "بيانات الدفع (يتم تشفيرها ولا نحتفظ بأرقام البطاقات كاملةً)",
                "سجل الطلبات والمنتجات التي تصفحتها",
                "بيانات الجهاز وعنوان IP ونوع المتصفح",
                "تفضيلاتك وإعداداتك على المنصة",
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
            <h2 className="text-lg font-bold text-gray-900 mb-3">٢. كيف نستخدم معلوماتك</h2>
            <ul className="space-y-2 list-none">
              {[
                "معالجة طلباتك وتأكيدها وتتبع شحنها حتى وصولها إليك",
                "التواصل معك بشأن طلباتك أو أي استفسارات",
                "تحسين تجربتك وتخصيص العروض والمنتجات المقترحة",
                "إرسال إشعارات العروض والخصومات (يمكنك إلغاء الاشتراك في أي وقت)",
                "منع الاحتيال وضمان أمان المعاملات",
                "الامتثال للمتطلبات القانونية والتنظيمية",
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
            <h2 className="text-lg font-bold text-gray-900 mb-3">٣. مشاركة المعلومات مع أطراف ثالثة</h2>
            <p className="mb-3">
              لا نبيع بياناتك الشخصية لأي طرف ثالث. قد نشارك معلوماتك فقط في الحالات التالية:
            </p>
            <ul className="space-y-2 list-none">
              {[
                "شركات الشحن والتوصيل لإتمام توصيل طلباتك",
                "مزودو خدمات الدفع الإلكتروني لمعالجة المعاملات المالية",
                "البائعون على المنصة بالقدر اللازم لتنفيذ طلبك فقط",
                "الجهات الحكومية والقضائية عند الاقتضاء القانوني",
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
            <h2 className="text-lg font-bold text-gray-900 mb-3">٤. ملفات تعريف الارتباط (Cookies)</h2>
            <p>
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك، وتذكّر تفضيلاتك، وتحليل أنماط الاستخدام. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال إعدادات متصفحك، مع العلم أن تعطيلها قد يؤثر على بعض وظائف الموقع.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">٥. أمان البيانات</h2>
            <p>
              نطبّق معايير أمان عالية لحماية بياناتك، تشمل التشفير SSL/TLS لجميع الاتصالات، وتشفير بيانات الدفع وفق معايير PCI-DSS، وتقييد الوصول إلى البيانات الشخصية على الموظفين المخوّلين فقط. رغم ذلك، لا يوجد نظام آمن بنسبة 100%، لذا نوصيك بالحفاظ على سرية كلمة مرورك.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">٦. حقوقك</h2>
            <p className="mb-3">لديك الحق في:</p>
            <ul className="space-y-2 list-none">
              {[
                "الاطلاع على بياناتك الشخصية المحفوظة لدينا",
                "تصحيح أي معلومات غير دقيقة",
                "طلب حذف حسابك وبياناتك",
                "إلغاء الاشتراك في الرسائل التسويقية",
                "تقديم شكوى لدى الجهات المختصة",
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
            <h2 className="text-lg font-bold text-gray-900 mb-3">٧. التواصل معنا</h2>
            <p>
              لأي استفسار بشأن سياسة الخصوصية أو لممارسة حقوقك، يمكنك التواصل معنا عبر:
            </p>
            <div className="mt-3 space-y-1 text-sm">
              <p>📧 البريد الإلكتروني: <a href="mailto:privacy@mawgood.com" className="text-[#F36418] hover:underline">privacy@mawgood.com</a></p>
              <p>📞 خط خدمة العملاء: <a href="tel:19911" className="text-[#F36418] hover:underline">19911</a></p>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}
