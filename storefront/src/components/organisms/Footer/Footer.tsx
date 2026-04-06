'use client'

import { useState } from 'react'
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
  'iPhone', 'Samsung', 'Xiaomi', 'Adidas', 'Nike',
  'Gucci', 'Apple Watch', 'Laptop', 'Headphones', 'Camera'
]

const brands = [
  { name: 'Samsung' },
  { name: 'Apple' },
  { name: 'Nike' },
  { name: 'Adidas' },
  { name: 'Sony' },
  { name: 'LG' },
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

export function FooterBrands() {
  const t = useTranslations('footer')
  const tSearch = useTranslations('popularSearch')

  const brandLinks = [
    { name: 'Samsung', label: tSearch('samsung') },
    { name: 'Apple', label: 'Apple' },
    { name: 'Nike', label: tSearch('nike') },
    { name: 'Adidas', label: tSearch('adidas') },
    { name: 'Sony', label: 'Sony' },
    { name: 'LG', label: 'LG' },
  ]

  return (
    <div className="mb-6">
      <h3 className="font-bold text-gray-800 mb-4">{t('brands')}</h3>
      <div className="grid grid-cols-3 gap-4">
        {brandLinks.map((brand) => (
          <LocalizedClientLink
            key={brand.name}
            href={`/search?q=${encodeURIComponent(brand.name)}`}
            className="h-12 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-600 text-sm font-medium">{brand.label}</span>
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}

export function FooterPopularSearch() {
  const t = useTranslations('footer')
  const tSearch = useTranslations('popularSearch')

  const popularSearchTerms = [
    { key: 'iphone', label: tSearch('iphone') },
    { key: 'samsung', label: tSearch('samsung') },
    { key: 'xiaomi', label: tSearch('xiaomi') },
    { key: 'adidas', label: tSearch('adidas') },
    { key: 'nike', label: tSearch('nike') },
    { key: 'appleWatch', label: tSearch('appleWatch') },
    { key: 'laptop', label: tSearch('laptop') },
    { key: 'headphones', label: tSearch('headphones') },
    { key: 'camera', label: tSearch('camera') },
  ]

  return (
    <div className="mb-6">
      <h3 className="font-bold text-gray-800 mb-4">{t('popularSearch')}</h3>
      <div className="flex flex-wrap gap-2">
        {popularSearchTerms.map((term) => (
          <LocalizedClientLink
            key={term.key}
            href={`/search?q=${encodeURIComponent(term.label)}`}
            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {term.label}
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
          <span>{t('address')}</span>
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

function FooterMobileSections() {
  const t = useTranslations('footer')
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({
    services: false,
    about: false,
    policies: false,
    app: false,
  })

  const toggleSection = (section: string) => {
    setIsExpanded(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const sections = [
    {
      key: 'services',
      label: t('customerServices'),
      links: [
        { href: '/faq', label: t('faqs') },
        { href: '/track-order', label: t('trackYourOrder') },
        { href: '/returns', label: t('returnPolicy') },
      ],
    },
    {
      key: 'about',
      label: t('about'),
      links: [
        { href: '/about', label: t('aboutUs') },
        { href: '/blog', label: t('blog') },
        { href: '/contact', label: t('contact') },
      ],
    },
    {
      key: 'policies',
      label: t('policies'),
      links: [
        { href: '/privacy-policy', label: t('privacyPolicy') },
        { href: '/terms-conditions', label: t('termsConditions') },
      ],
    },
  ]

  return (
    <div className="space-y-2">
      {sections.map(({ key, label, links }) => (
        <div key={key} className="border-b border-gray-200">
          <button
            onClick={() => toggleSection(key)}
            className="w-full flex items-center justify-between py-3 text-gray-800 font-medium"
          >
            <span>{label}</span>
            <ArrowRightIcon size={16} className={`transition-transform ${isExpanded[key] ? 'rotate-90' : ''}`} />
          </button>
          {isExpanded[key] && (
            <div className="pb-3 space-y-2">
              {links.map(link => (
                <LocalizedClientLink key={link.href} href={link.href} className="block text-sm text-gray-600">
                  {link.label}
                </LocalizedClientLink>
              ))}
            </div>
          )}
        </div>
      ))}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('app')}
          className="w-full flex items-center justify-between py-3 text-gray-800 font-medium"
        >
          <span>{t('downloadApp')}</span>
          <ArrowRightIcon size={16} className={`transition-transform ${isExpanded['app'] ? 'rotate-90' : ''}`} />
        </button>
        {isExpanded['app'] && (
          <div className="pb-3 flex gap-2">
            <button className="px-4 py-2 bg-black text-white rounded-lg text-sm">App Store</button>
            <button className="px-4 py-2 bg-black text-white rounded-lg text-sm">Google Play</button>
          </div>
        )}
      </div>
    </div>
  )
}

export function FooterLinks() {
  const t = useTranslations('footer')
  return (
    <>
      <div className="hidden lg:block border-t border-gray-200 mt-8 pt-8">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-gray-800 mb-4">{t('customerServices')}</h4>
            <ul className="space-y-2">
              <li><LocalizedClientLink href="/faq" className="text-sm text-gray-600">{t('faqs')}</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/track-order" className="text-sm text-gray-600">{t('trackYourOrder')}</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/returns" className="text-sm text-gray-600">{t('returnPolicy')}</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/delivery" className="text-sm text-gray-600">{t('deliveryShipping')}</LocalizedClientLink></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-4">{t('about')}</h4>
            <ul className="space-y-2">
              <li><LocalizedClientLink href="/about" className="text-sm text-gray-600">{t('aboutUs')}</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/blog" className="text-sm text-gray-600">{t('blog')}</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/careers" className="text-sm text-gray-600">{t('careers')}</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/contact" className="text-sm text-gray-600">{t('contact')}</LocalizedClientLink></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-4">{t('policies')}</h4>
            <ul className="space-y-2">
              <li><LocalizedClientLink href="/privacy-policy" className="text-sm text-gray-600">{t('privacyPolicy')}</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/terms-conditions" className="text-sm text-gray-600">{t('termsConditions')}</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/return-policy" className="text-sm text-gray-600">{t('returnPolicy')}</LocalizedClientLink></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-4">{t('downloadApp')}</h4>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-black text-white rounded-lg text-sm">App Store</button>
              <button className="px-4 py-2 bg-black text-white rounded-lg text-sm">Google Play</button>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:hidden border-t border-gray-200 mt-8 pt-4">
        <FooterMobileSections />
      </div>
    </>
  )
}

export function FooterPolicies() {
  const t = useTranslations('footer')
  const policyLinks = [
    { label: t('privacyPolicy'), href: '/privacy-policy' },
    { label: t('termsConditions'), href: '/terms-conditions' },
    { label: t('returnPolicy'), href: '/return-policy' },
    { label: t('trackYourOrder'), href: '/track-order' },
  ]
  return (
    <div className="py-4 border-t border-b border-gray-200">
      <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
        {policyLinks.map((policy) => (
          <LocalizedClientLink
            key={policy.href}
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
  const t = useTranslations('footer')
  return (
    <div className="py-4 text-center">
      <p className="text-sm text-gray-500">
        © 2026 {t('allRightsReserved')}
      </p>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-gray-50 mt-12" data-testid="footer">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div><FooterBrands /></div>
          <div><FooterPopularSearch /></div>
          <div><FooterContact /></div>
          <div><FooterPayment /></div>
        </div>
        <FooterLinks />
        <FooterPolicies />
        <FooterBottom />
      </div>
    </footer>
  )
}
