'use client'

import { useState } from 'react'
import Image from 'next/image'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { useTranslations } from 'next-intl'
import { 
  FacebookColorIcon, 
  InstagramIcon, 
  LinkedinIcon, 
  LocationIcon,
  ArrowRightIcon
} from '@/icons'

const popularSearchTerms = [
  'آيفون', 'سامسونج', 'شاومي', 'أديداس', 'نايك',
  'جيميش', 'أبل ووتش', 'لابتوب', 'سماعات', 'كاميرا'
]

const brands = [
  { name: 'Samsung', logo: '/brands/samsung.png' },
  { name: 'Apple', logo: '/brands/apple.png' },
  { name: 'Nike', logo: '/brands/nike.png' },
  { name: 'Adidas', logo: '/brands/adidas.png' },
  { name: 'Sony', logo: '/brands/sony.png' },
  { name: 'LG', logo: '/brands/lg.png' },
]

const paymentMethods = [
  { name: 'Visa', icon: '💳' },
  { name: 'MasterCard', icon: '💳' },
  { name: 'Meeza', icon: '💳' },
  { name: 'Fawry', icon: '📱' },
  { name: 'ValU', icon: '💰' },
  { name: 'Vodafone Cash', icon: '📱' },
  { name: 'InstaPay', icon: '🏦' },
]

const policies = [
  { label: 'سياسة الخصوصية', href: '/privacy-policy' },
  { label: 'الشروط والأحكام', href: '/terms-conditions' },
  { label: 'سياسة الإرجاع', href: '/return-policy' },
  { label: 'تتبع طلبك', href: '/track-order' },
]

export function FooterBrands() {
  return (
    <div className="mb-6">
      <h3 className="font-bold text-gray-800 mb-4">الماركات</h3>
      <div className="grid grid-cols-3 gap-4">
        {brands.map((brand) => (
          <div key={brand.name} className="h-12 bg-gray-50 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-sm">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FooterPopularSearch() {
  const t = useTranslations('footer')
  
  return (
    <div className="mb-6">
      <h3 className="font-bold text-gray-800 mb-4">البحث الشائع</h3>
      <div className="flex flex-wrap gap-2">
        {popularSearchTerms.map((term) => (
          <LocalizedClientLink
            key={term}
            href={`/search?q=${encodeURIComponent(term)}`}
            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {term}
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}

export function FooterContact() {
  const t = useTranslations('footer')
  
  return (
    <div className="mb-6">
      <h3 className="font-bold text-gray-800 mb-4">{t('contactUs')}</h3>
      <div className="space-y-3">
        <a href="tel:19911" className="flex items-center gap-2 text-gray-600">
          <span>📞</span>
          <span>19911</span>
        </a>
        <a href="mailto:support@mercur.com" className="flex items-center gap-2 text-gray-600">
          <span>✉️</span>
          <span>support@mercur.com</span>
        </a>
        <div className="flex items-center gap-2 text-gray-600">
          <LocationIcon size={18} />
          <span>القاهرة، مصر</span>
        </div>
      </div>
      
      <div className="flex gap-3 mt-4">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <FacebookColorIcon size={20} />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
          <InstagramIcon size={20} color="#fff" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
          <LinkedinIcon size={20} color="#fff" />
        </a>
      </div>
    </div>
  )
}

export function FooterPayment() {
  const t = useTranslations('footer')
  
  return (
    <div className="mb-6">
      <h3 className="font-bold text-gray-800 mb-4">{t('paymentMethods')}</h3>
      <div className="grid grid-cols-4 gap-2">
        {paymentMethods.map((method) => (
          <div key={method.name} className="h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl" title={method.name}>
            {method.icon}
          </div>
        ))}
      </div>
    </div>
  )
}

export function FooterPolicies() {
  return (
    <div className="py-4 border-t border-b border-gray-200">
      <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
        {policies.map((policy) => (
          <LocalizedClientLink
            key={policy.label}
            href={policy.href}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {policy.label}
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}

export function FooterBottom() {
  const t = useTranslations('common')
  const tFooter = useTranslations('footer')
  
  return (
    <div className="py-4 text-center">
      <p className="text-sm text-gray-500">
        © 2026 {tFooter('allRightsReserved')}
      </p>
    </div>
  )
}

export function Footer() {
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({
    brands: false,
    search: false,
    contact: false,
    payment: false,
  })

  const toggleSection = (section: string) => {
    setIsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <footer className="bg-gray-50 mt-12 overflow-hidden">
      <div className="container mx-auto px-4 py-8 max-w-screen-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <FooterBrands />
          </div>
          
          <div>
            <FooterPopularSearch />
          </div>
          
          <div>
            <FooterContact />
          </div>
          
          <div>
            <FooterPayment />
          </div>
        </div>

        <div className="hidden lg:block border-t border-gray-200 mt-8 pt-8">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-gray-800 mb-4">خدمات العملاء</h4>
              <ul className="space-y-2">
                <li><LocalizedClientLink href="/faq" className="text-sm text-gray-600">الأسئلة الشائعة</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/track-order" className="text-sm text-gray-600">تتبع طلبك</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/returns" className="text-sm text-gray-600">سياسة الإرجاع</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/delivery" className="text-sm text-gray-600">التوصيل والشحن</LocalizedClientLink></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800 mb-4">عن الموقع</h4>
              <ul className="space-y-2">
                <li><LocalizedClientLink href="/about" className="text-sm text-gray-600">من نحن</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/blog" className="text-sm text-gray-600">المدونة</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/careers" className="text-sm text-gray-600">وظائف</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/contact" className="text-sm text-gray-600">اتصل بنا</LocalizedClientLink></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800 mb-4">سياسات</h4>
              <ul className="space-y-2">
                <li><LocalizedClientLink href="/privacy-policy" className="text-sm text-gray-600">سياسة الخصوصية</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/terms-conditions" className="text-sm text-gray-600">الشروط والأحكام</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/return-policy" className="text-sm text-gray-600">سياسة الإرجاع</LocalizedClientLink></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800 mb-4">تحميل التطبيق</h4>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-black text-white rounded-lg text-sm">App Store</button>
                <button className="px-4 py-2 bg-black text-white rounded-lg text-sm">Google Play</button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden border-t border-gray-200 mt-8 pt-4">
          <div className="space-y-2">
            {['services', 'about', 'policies', 'app'].map((section) => (
              <div key={section} className="border-b border-gray-200">
                <button 
                  onClick={() => toggleSection(section)}
                  className="w-full flex items-center justify-between py-3 text-gray-800 font-medium"
                >
                  <span>{section === 'services' ? 'خدمات العملاء' : section === 'about' ? 'عن الموقع' : section === 'policies' ? 'سياسات' : 'تحميل التطبيق'}</span>
                  <ArrowRightIcon size={16} className={`transition-transform ${isExpanded[section] ? 'rotate-90' : ''}`} />
                </button>
                {isExpanded[section] && (
                  <div className="pb-3 space-y-2">
                    {section === 'services' && (
                      <>
                        <LocalizedClientLink href="/faq" className="block text-sm text-gray-600">الأسئلة الشائعة</LocalizedClientLink>
                        <LocalizedClientLink href="/track-order" className="block text-sm text-gray-600">تتبع طلبك</LocalizedClientLink>
                        <LocalizedClientLink href="/returns" className="block text-sm text-gray-600">سياسة الإرجاع</LocalizedClientLink>
                      </>
                    )}
                    {section === 'about' && (
                      <>
                        <LocalizedClientLink href="/about" className="block text-sm text-gray-600">من نحن</LocalizedClientLink>
                        <LocalizedClientLink href="/blog" className="block text-sm text-gray-600">المدونة</LocalizedClientLink>
                        <LocalizedClientLink href="/contact" className="block text-sm text-gray-600">اتصل بنا</LocalizedClientLink>
                      </>
                    )}
                    {section === 'policies' && (
                      <>
                        <LocalizedClientLink href="/privacy-policy" className="block text-sm text-gray-600">سياسة الخصوصية</LocalizedClientLink>
                        <LocalizedClientLink href="/terms-conditions" className="block text-sm text-gray-600">الشروط والأحكام</LocalizedClientLink>
                      </>
                    )}
                    {section === 'app' && (
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-black text-white rounded-lg text-sm">App Store</button>
                        <button className="px-4 py-2 bg-black text-white rounded-lg text-sm">Google Play</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <FooterPolicies />
        <FooterBottom />
      </div>
    </footer>
  )
}
